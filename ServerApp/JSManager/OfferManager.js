var erisC = require('eris-contracts');
var fs = require('fs');
var utils = require('./Utils');
var config = require('../config');

/**
 * Constructor for object offer
 * @param {String} offerName - Name of the Offer
 * @param {String} period - Period for the offer
 * @param {int} duration - Approximative duration of the task
 * @param {String} location - Location of the task
 * @param {String} type - Type of task
 * @param {String} description - Description of the offer
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
 * @param {Address} beneficiary - Address of the Elederly who created the offer
 * @param {String} offerId - ID of the offer
 * @param {int} reward - Amount of the reward
 * @param {Offer} data - Offer object
 * @param {Address} volunteer - Address of the volunteer who comitted to the offer
 * @param {bool} claimed - True if the volunteer claimed the offer
 * @param {bool} confirmed - True if the elderly confirmed the offer have been fullfilled
 * @param {int} confirmedOn - Block on which the offer have been confirmed
 */
function OfferObject(beneficiary, offerId, reward, data, volunteer, claimed, confirmed, confirmedOn) {
    this.beneficiary = beneficiary;
    this.offerId = utils.hexToString(offerId);
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
 * @param {HexString} prev - Name of the previous element
 * @param {HexString} next - Name of the next element
 * @param {HexString} current - Name of the current 
 * @param {Address} address - Address of the contract
 */
function Element(prev, next, current, address) {
    this.prev = utils.hexToString(prev);
    this.next = utils.hexToString(next);
    this.current = utils.hexToString(current);
    this.address = address;
}

/**
 * Transform an Offer into a single string
 */
Offer.prototype.toString = function () {
    return JSON.stringify(this);
}

/**
 * Determine the Id for a newly created offer
 */
Offer.prototype.findId = function () {
    return this.offerName; //TODO make hash with offerName+time
}

/**
 * Compute the amounte of the reward based on duration and options
 */
Offer.prototype.computeReward = function () {
    return this.duration; //TODO consider options
}

/**
 * Constructor for the offer Manager
 * @param {Object} contractsManager - Contracts Manager object to use to communicate with the chain
 */
function OfferManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractsManager;
    //Get action manager
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync(config.abiDir + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);
    //Get DOUG address
    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    /**
     * Call execute on the action manager
     * @param {String} actionName - Name of the action to execute on the chain
     * @param {Address} address - address typed parameter
     * @param {String} str - string typed parameter
     * @param {Number} intVal - int typed parameter
     * @param {String} data - string type parameter with "unlimited" size
     * @param {function} callback - callback function
     */
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

    /**
     * Add a new offer to the database
     * @param {Offer} offer - The offer to add
     * @param {function} callback - callback function
     */
    this.addOffer = function (offer, callback) {
        return this.executeAction("addoffer", "0x0", offer.findId(), offer.computeReward(), offer.toString(), callback);
    };

    /**
     * Remove an offer from the database
     * @param {String} offerId - Id of the offer to remove
     * @param {function} callback - callback function
     */
    this.removeOffer = function (offerId, callback) {
        return this.executeAction("removeoffer", "0x0", offerId, 0, "", callback);
    }

    /**
     * Commit to an offer
     * @param {String} offerId - Id of the offer to commit to
     * @param {function} callback - callback function
     */
    this.commitToOffer = function (offerId, callback) {
        return this.executeAction("committooffer", "0x0", offerId, 0, "", callback);
    }

    /**
     * Claim an offer
     * @param {String} offerId - Id of the offer to claim
     * @param {function} callback - callback function
     */
    this.claimOffer = function (offerId, callback) {
        return this.executeAction("claimoffer", "0x0", offerId, 0, "", callback);
    }

    /**
     * Confirm an offer execution
     * @param {String} offerId - Id of the offer to confirm
     * @param {function} callback - callback function
     */
    this.confirmOffer = function (offerId, callback) {
        return this.executeAction("confirmoffer", 0x0, offerId, 0, "", callback);
    }

    /**
     * Get offers related to a user
     * @param {Address} userAddress - User address we want related offers
     * @param {function} callback - callback function
     */
    this.getUserOffers = function (userAddress, availableOnly, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getOfferDbAddress(dougContract)
            .then((offerDbAddress) => {
                return getOfferList(offerDbAddress, contractData, contractsManager, dougContract);
            })
            .then((list) => {
                return getOfferData(contractData, contractsManager, list, userAddress, availableOnly);
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

    /**
     * Get all the offers of the database
     * @param {function} callback - Callback function
     */
    this.getOffers = function (availableOnly, callback) {
        return this.getUserOffers(null, availableOnly, callback);
    }

    /**
     * Get an offer from its ID
     * @param {String} offerId - Id of the offer to get
     * @param {function} callback - Callback function
     */
    this.getOffer = function (offerId, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        return getOfferDbAddress(dougContract)
            .then((offerDbAddress) => {
                return getOfferAddress(offerId, offerDbAddress, contractData, contractsManager);
            })
            .then((offerAddress) => {
                var elem = new Element(0, 0, 0, offerAddress);
                return getOfferData(contractData, contractsManager, [elem], null, null);
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

    /**
     * Get an offer address from its name
     * @param {String} offerId - Name of the offer
     * @param {Address} offerDbAddress - Address of the offer database
     * @param {*} contractData 
     * @param {Object} contractsManager - Contract manager to use to query the database
     */
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

    /**
     * Get the address of the offer database
     * @param {Object} dougContract - Doug contract interface
     */
    function getOfferDbAddress(dougContract) {
        return new Promise((resolve, reject) => {
            dougContract.contracts("offers", (error, offerAddress) => {
                if (error) reject(error);
                resolve(offerAddress);
            })
        })
    }

    /**
     * Get list of the offers name and their addresses
     * @param {Address} offerDbAddress - Address of the offer DB
     * @param {*} contractData 
     * @param {Object} contractsManager - Contract Manager used to query the chain
     * @param {Object} dougContract - Doug contract interface
     */
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
    function getOfferData(contractData, contractsManager, list, userAddress, availableOnly) {
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
                        if ((!userAddress || userAddress == oo.beneficiary || userAddress == oo.volunteer)
                                && (!availableOnly || oo.beneficiary == 0x0)) {
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
