var erisC = require('eris-contracts');
var fs = require('fs');
var utils = require('./Utils');
var config = require('../config');

/**
 * Constructor for object offer
 * @param {String} offerName
 * @param {String} period 
 * @param {int} duration 
 * @param {String} location 
 * @param {String} type 
 * @param {String} description 
 * @param {JSON} option 
 */
function Offer(offerName, period, duration, location, type, description, option) {
    this.offerName = offerName;
    this.period = period;
    this.duration = duration;
    this.location = location;
    this.type = type;
    this.description = description;
    this.option = option;
}

/**
 * Constructor for object offer, as found on the blockchain
 * @param {Address} beneficiary 
 * @param {String} offerName 
 * @param {int} reward 
 * @param {Offer} data 
 * @param {Address} volunteer 
 * @param {bool} claimed 
 * @param {bool} confirmed 
 * @param {int} confirmedOn
 */
function OfferObject(beneficiary, offerName, reward, data, volunteer, claimed, confirmed, confirmedOn) {
    this.beneficiary = beneficiary;
    this.offerId = utils.hexToString(offerName);
    this.reward = reward.toNumber();
    let o = JSON.parse(utils.hexToString(data));
    this.data = new Offer(o.offerName, o.period, o.duration, o.location, o.type, o.description, o.option);
    this.volunteer = volunteer;
    this.claimed = claimed;
    this.confirmed = confirmed;
    this.confirmedOn = confirmedOn.toNumber();
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

Offer.prototype.toString = function () {
    return JSON.stringify(this);
}

Offer.prototype.findId = function () {
    return this.offerName; //TODO make hash with offerName+time
}

Offer.prototype.computeReward = function () {
    return this.duration; //TODO consider options
}

/**
 * Constructor for the offer Manager
 * @param {Object} contractsManager 
 */
function OfferManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync(config.abiDir + actionManagerContractAddress));
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

    this.addOffer = function (offer, callback) {
        return this.executeAction("addoffer", "0x0", offer.findId(), offer.computeReward(), offer.toString(), callback);
    };

    this.removeOffer = function (offerName, callback) {
        return this.executeAction("removeoffer", "0x0", offerName, 0, "", callback);
    }

    this.commitToOffer = function (offerName, callback) {
        return this.executeAction("committooffer", "0x0", offerName, 0, "", callback);
    }

    this.claimOffer = function (offerName, callback) {
        return this.executeAction("claimoffer", "0x0", offerName, 0, "", callback);
    }

    this.confirmOffer = function (offerName, callback) {
        return this.executeAction("confirmoffer", 0x0, offerName, 0, "", callback);
    }


    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);


    this.getUserOffers = function (userAddress, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getOfferDbAddress(contractData, contractsManager, dougContract)
            .then((offerDbAddress) => {
                return getOfferList(offerDbAddress, contractData, contractsManager, dougContract);
            })
            .then((list) => {
                return getOfferData(contractData, contractsManager, list, userAddress);
            }).then((offerList) => {
                if (callback) callback(null, offerList);
                else {
                    return new Promise((resolve, reject) => {
                        resolve(offerList);
                    })
                }
            })
            .catch((error) => {
                throw (error);
            })
    }

    /*Get offers*/
    this.getOffers = function (callback) {
        return this.getUserOffers(null, callback);
    }

    this.getOffer = function (offerId, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getOfferDbAddress(contractData, contractsManager, dougContract)
            .then((offerDbAddress) => {
                return getOfferAddress(offerId, offerDbAddress, contractData, contractsManager);
            })
            .then((offerAddress) => {
                var elem = new Element(0, 0, 0, offerAddress);
                return getOfferData(contractData, contractsManager, [elem], null);
            }).then((offerList) => {
                let returnVal = offerList[0] ? offerList[0] : [];
                if (callback) callback(null, returnVal);
                else {
                    return new Promise((resolve, reject) => {
                        resolve(returnVal);
                    })
                }
            }).catch((error) => {
                throw (error);
            })
    }

    function getOfferAddress(offerId, offerDbAddress, contractData, contractsManager) {
        /*Get OfferDB ABI */
        let offersContractAddress = contractData["deployOffers"];
        let offersAbi = JSON.parse(fs.readFileSync(config.abiDir + offersContractAddress));
        let offerContract = contractsManager.newContractFactory(offersAbi).at(offerDbAddress);

        return new Promise((resolve, reject) => {
            offerContract.getAddress(offerId, function (error, result) {
                if (error) reject(error);
                resolve(result);
            })
        })

    }

    function getOfferDbAddress(contractData, contractsManager, dougContract) {
        return new Promise((resolve, reject) => {
            dougContract.contracts("offers", (error, offerAddress) => {
                if (error) reject(error);
                resolve(offerAddress);
            })
        })
    }

    function getOfferList(offerDbAddress, contractData, contractsManager, dougContract) {
        let offersContractAddress = contractData["deployOffers"];
        let offersAbi = JSON.parse(fs.readFileSync(config.abiDir + offersContractAddress));
        let offerContract = contractsManager.newContractFactory(offersAbi).at(offerDbAddress);

        return new Promise((resolve, reject) => {
            /*Compile offers in list*/
            let list = [];
            //todo consider current key == null
            offerContract.tail(function (error, result) {
                if (error) reject(error);

                var currentKey = result;
                function getElems(key) {
                    offerContract.getElement(key, function (err, res) {
                        let elem = new Element(res[0], res[1], res[2], res[3]);
                        list.push(elem);
                        currentKey = elem.next;
                        let head = list[0];
                        if (currentKey != head.current && currentKey != "") {
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

    /**
     * Get a list of offer from a list of addresses
     * @param {Object} contractData - Data from the output of epm.yaml
     * @param {Object} contractsManager - The contract manager
     * @param {Array} list - List of 'Element'
     * @param {function} callback 
     */
    function getOfferData(contractData, contractsManager, list, userAddress) {
        /*Get Offer ABI*/
        let offerContractAddress = contractData["Offer"];
        let offerAbi = JSON.parse(fs.readFileSync(config.abiDir + offerContractAddress));

        let offerList = [];
        let size = list.length;

        return new Promise((resolve, reject) => {
            list.forEach((offer) => {
                if (offer.address != 0x0) {
                    let contract = contractsManager.newContractFactory(offerAbi).at(offer.address);

                    contract.getData((error, res) => {
                        if (error) reject(error);
                        let oo = new OfferObject(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7]);
                        if (!userAddress || userAddress == oo.beneficiary || userAddress == oo.volunteer) {
                            offerList.push(oo);
                        } else {
                            size--;
                        }
                        if (offerList.length == size) {
                            resolve(offerList);
                        }
                    })
                } else {
                    size--;
                    if (offerList.length == size) {
                        resolve(offerList);
                    }
                }
            })
        })
    }

}

module.exports = {
    Offer: Offer,
    OfferManager: OfferManager
}
