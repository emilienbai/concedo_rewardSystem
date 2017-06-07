var burrowC = require('@monax/legacy-contracts');
var fs = require('fs');
var utils = require('./Utils');
var config = require('../config');
var crypto = require('crypto');
var aes256 = require('nodejs-aes256');
const am = require("./ActionManager");

/**
 * Constructor for the reward object
 * @param {String} rewardName 
 * @param {int} count 
 * @param {Date} timestamp 
 * @param {JSON} description 
 * @param {string} code 
 */
function Reward(rewardName, price, count, timestamp, description, code) {
    this.rewardName = rewardName;
    this.price = parseInt(price, 10);
    this.count = count;
    this.timestamp;
    this.description = description;
    this.code = code//encrypt(code);
}

Reward.prototype.toString = function () {
    return JSON.stringify(this);
}

Reward.prototype.encrypt = function () {
    let ciphertext = aes256.encrypt(config.rewardPassword, this.code);
    this.code = ciphertext;
}

Reward.prototype.decrypt = function () {
    let plaintext = aes256.decrypt(config.rewardPassword, this.code);
    this.code = plaintext;
}

Reward.prototype.findId = function () {
    let str = this.rewardName + this.timestamp + this.count;
    //Use of 256bit hash function should prevent hash collision
    let hash = crypto.createHash('sha256')
    hash.update(str);
    return hash.digest('hex');

}

function RewardObject(rewardId, rewarder, buyer, price, data) {
    this.rewardId = rewardId.toLowerCase();
    this.rewarder = rewarder;
    this.buyer = buyer;
    this.price = price.toNumber();
    let r = JSON.parse(utils.hexToString(data));
    this.data = new Reward(r.rewardName, r.price, r.count, r.timestamp, r.description, r.code);
}

/**
 * Contructor for the Element object
 * @param {HexString} prev 
 * @param {HexString} next 
 * @param {HexString} current 
 * @param {Address} address 
 */
function Element(prev, next, current, address) {
    this.prev = prev;
    this.next = next;
    this.current = current;
    this.address = address;
}

function RewardManager(contractsManager) {
    /*Get data from deployement*/
    this.contractsManager = contractsManager;

    this.contractData = require('../../jobs_output.json');
    this.actionManager = new am.ActionManager(this.contractsManager);

    let dougContractAddress = this.contractData["deployDoug"];
    const dougAbi = JSON.parse(fs.readFileSync(config.abiDir + "Doug_ABI.json"));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    const rewardsAbi = JSON.parse(fs.readFileSync(config.abiDir + "RewardDB_ABI.json"));
    const rewardAbi = JSON.parse(fs.readFileSync(config.abiDir + "Reward_ABI.json"));

    this.addReward = function (reward, callback) {
        reward.encrypt();
        return this.actionManager.executeAction("addreward", "0x0", reward.findId(), reward.price, reward.toString(), callback);
    };

    this.removeReward = function (rewardName, callback) {
        return this.actionManager.executeAction("removereward", "0x0", rewardName, 0, "", callback);
    }

    this.buyReward = function (rewardName, callback) {
        return this.actionManager.executeAction("buyreward", "0x0", rewardName, 0, "", callback);
    }

    this.getUserRewards = function (userAddress, availableOnly, callback) {
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getRewardDbAddress(dougContract)
            .then((rewardDbAddress) => {
                return getRewardList(rewardDbAddress, contractsManager);
            })
            .then((list) => {
                return getRewardData(contractsManager, list, userAddress, availableOnly);
            })
            .then((rewardList) => {
                if (callback) callback(null, rewardList);
                else {
                    return new Promise((resolve, reject) => {
                        resolve(rewardList);
                    })
                }
            }).catch((error) => {
                throw (error);
            })
    }

    this.getRewards = function (availableOnly, callback) {
        return this.getUserRewards(null, availableOnly, callback);
    }

    this.getReward = function (rewardId, callback) {
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getRewardDbAddress(dougContract)
            .then((rewardDbAddress) => {
                return getRewardAddress(rewardId, rewardDbAddress, contractsManager);
            }).then((rewardAddress) => {
                var elem = new Element(0, 0, 0, rewardAddress);
                return getRewardData(contractsManager, [elem], null, false);
            }).then((rewardList) => {
                let returnVal = rewardList[0] ? rewardList[0] : [];
                if (callback) callback(null, returnVal);
                else {
                    return new Promise((resolve, reject) => {
                        resolve(returnVal);
                    })
                }
            }).catch((error) => {
                reject(error);
            })
    }

    function getRewardAddress(rewardId, rewardDbAddress, contractsManager) {
        let rewardsContract = contractsManager.newContractFactory(rewardsAbi).at(rewardDbAddress);

        return new Promise((resolve, reject) => {
            rewardsContract.getAddress(rewardId, (error, address) => {
                if (error) reject(error);
                else resolve(address);
            })
        })
    }

    function getRewardDbAddress(dougContract) {
        return new Promise((resolve, reject) => {
            dougContract.contracts("rewards", (error, rewardDbAddress) => {
                if (error) reject(error);
                else resolve(rewardDbAddress);
            })
        })
    }

    function getRewardList(rewardDbAddress, contractsManager) {
        let rewardContract = contractsManager.newContractFactory(rewardsAbi).at(rewardDbAddress);

        return new Promise((resolve, reject) => {
            let list = [];

            rewardContract.tail((error, result) => {
                if (error) reject(error);
                var currentKey = result;
                function getElems(key) {
                    rewardContract.getElement(key, function (err, res) {
                        let elem = new Element(res[0], res[1], res[2], res[3]);
                        list.push(elem);
                        currentKey = elem.next;
                        let tail = list[0];
                        if (currentKey != tail.current && parseInt(currentKey, 16) != 0) {
                            getElems(currentKey);
                        } else {
                            resolve(list);
                        }
                    })
                }
                getElems(currentKey);
            })
        })
    }

    function getRewardData(contractsManager, list, userAddress, availableOnly) {
        let rewardList = [];
        let size = list.length;
        return new Promise((resolve, reject) => {
            list.forEach((reward) => {
                if (reward.address != 0x0) {
                    let contract = contractsManager.newContractFactory(rewardAbi).at(reward.address);

                    contract.getData((error, res) => {
                        if (error) reject(error);
                        let ro = new RewardObject(res[0], res[1], res[2], res[3], res[4]);
                        if ((!userAddress || userAddress == ro.rewarder || userAddress == ro.buyer)
                            && (!availableOnly || ro.buyer == 0x0)) {
                            rewardList.push(ro);
                        } else {
                            size--;
                        }
                        if (rewardList.length == size) {
                            resolve(rewardList);
                        }
                    })
                } else {
                    size--;
                    if (rewardList.length == size) {
                        resolve(rewardList);
                    }
                }
            })
        })
    }
}

function removeCode(rewardObjectArray) {
    for (var i = 0; i < rewardObjectArray.length; i++) {
        rewardObjectArray[i].data.code = "";
    }
}

module.exports = {
    Reward: Reward,
    RewardManager: RewardManager,
    removeCode: removeCode
}