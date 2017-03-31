var erisC = require('eris-contracts');
var fs = require('fs');
var utils = require('./Utils');

function encrypt(toEncrypt) {
    return toEncrypt; //TODO true encryption -> see if code does not depend on count ?
}

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
    this.price = price;
    this.count = count;
    this.timestamp;
    this.description = description;
    this.encryptedCode = encrypt(code);
}

Reward.prototype.toString = function () {
    return JSON.stringify(this);
}

Reward.prototype.findId = function () {
    return this.rewardName; //TODO hash with count and timestamp
}

function RewardObject(owner, rewardName, rewarder, buyer, price, data) {
    this.owner = owner;
    this.rewardName = utils.hexToString(rewardName);
    this.rewarder = rewarder;
    this.buyer = buyer;
    this.price = price.toNumber();
    let r = JSON.parse(utils.hexToString(data));
    this.data = new Reward(r.rewardName, r.price, r.count, r.timestamp, r.description, r.encryptedCode);
}

/**
 * Contructor for the Element object
 * @param {HexString} prev 
 * @param {HexString} next 
 * @param {HexString} current 
 * @param {Address} address 
 */
function Element(prev, next, current, address) {
    this.prev = utils.hexToString(prev);
    this.next = utils.hexToString(next);
    this.current = utils.hexToString(current);
    this.address = address;
}

function RewardManager(contractManager) {
    /*Get data from deployement*/
    this.contractData = require('../jobs_output.json');

    this.contractsManager = contractManager;
    /*Get ActionManager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


    this.executeAction = function (actionName, address, str, intVal, data, callback) {
        var amc = this.actionManagerContract;
        if (callback) {
            return amc.execute(actionName, address, str, intVal, data, callback);
        }
        return new Promise((resolve, reject) => {
            amc.execute(actionName, address, str, intVal, data,
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                })
        })
    }


    this.addReward = function (reward, callback) {
        return this.executeAction("addreward", "0x0", reward.findId(), reward.price, reward.toString(), callback);
    };

    this.removeReward = function (rewardName, callback) {
        return this.executeAction("removereward", "0x0", rewardName, 0, "", callback);
    }

    this.buyReward = function (rewardName, callback) {
        return this.executeAction("buyreward", 0x0, rewardName, 0, "", callback);
    }

    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync("./abi/" + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);


    function getRewardData(contractData, contractsManager, list, callback) {
        /*Get Reward ABI*/
        let offerContractAddress = contractData["Reward"];
        let offerAbi = JSON.parse(fs.readFileSync("./abi/" + offerContractAddress));

        let rewardList = [];
        let size = list.length;

        list.forEach((reward) => {
            let contract = contractsManager.newContractFactory(offerAbi).at(reward.address);

            contract.getData((error, res) => {
                let ro = new RewardObject(res[0], res[1], res[2], res[3], res[4], res[5]);
                rewardList.push(ro);
                if (rewardList.length == size) {
                    callback(null, rewardList);
                }
            })
        })
    }


    function onRewardDbFound(rewardDbAddress, contractData, contractsManager, callback) {
        /*Get RewardDb ABI */
        let rewardsContractAddress = contractData["deployRewards"];
        let rewardsAbi = JSON.parse(fs.readFileSync("./abi/" + rewardsContractAddress));
        let rewardContract = contractsManager.newContractFactory(rewardsAbi).at(rewardDbAddress);

        /*Compile offers in list*/
        let list = [];

        rewardContract.tail(function (error, result) {
            if (error) {
                callback(error, null);
            }
            var currentKey = result;

            function finished() {
                getRewardData(contractData, contractsManager, list, callback);
            }

            function getElems(key) {
                rewardContract.getElement(key, function (err, res) {
                    if (err) {
                        callback(err, null);
                    }
                    let elem = new Element(res[0], res[1], res[2], res[3]);
                    list.push(elem);
                    currentKey = elem.next;
                    let head = list[0];
                    if (currentKey != head.current && currentKey != "") {
                        getElems(currentKey);
                    } else {
                        finished();
                    }
                })
            }
            getElems(currentKey);
        })
    }

    /*Get rewards*/
    this.getRewards = function (callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        if (callback) {
            dougContract.contracts("rewards", (error, rewardAddress) => {
                if (error) {
                    return callback(error, null);
                }
                return onRewardDbFound(rewardAddress, contractData, contractsManager, callback);
            })
        }
        else {
            return new Promise((resolve, reject) => {
                dougContract.contracts("rewards", (error, rewardAddress) => {
                    if (error) return reject(error);
                    onRewardDbFound(rewardAddress, contractData, contractsManager, (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    });
                })
            })
        }
    }

}

module.exports = {
    Reward: Reward,
    RewardManager: RewardManager,
}