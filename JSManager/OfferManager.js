var erisC = require('eris-contracts');
var fs = require ('fs');
var utils = require('./Utils');

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
function Offer(offerName, period, duration, location, type, description, option){
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
 */
function OfferObject(beneficiary, offerName, reward, data, volunteer, claimed, confirmed){
    this.beneficiary = beneficiary;
    this.offerName = utils.hexToString(offerName);
    this.reward = reward.toNumber();
    let o = JSON.parse(utils.hexToString(data));
    this.data = new Offer(o.offerName, o.period, o.duration, o.location, o.type, o.description, o.option);
    this.volunteer = volunteer;
    this.claimed = claimed;
    this.confirmed = confirmed;
}

/**
 * Contructor for the Element object
 * @param {HexString} prev 
 * @param {HexString} next 
 * @param {HexString} current 
 * @param {Address} address 
 */
function Element(prev, next, current, address){
    this.prev = utils.hexToString(prev);
    this.next = utils.hexToString(next);
    this.current = utils.hexToString(current);
    this.address = address;
}

Offer.prototype.toString = function(){
    return JSON.stringify(this);
}

Offer.prototype.findId = function(){
    return this.offerName; //TODO make hash with offerName+time
}

Offer.prototype.computeReward = function(){
    return this.duration; //TODO consider options
}

/**
 * Constructor for the offer Manager
 * @param {Object} contractsManager 
 */
function OfferManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../jobs_output.json');

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


    this.executeAction = function (actionName, address, str, intVal, data, callback){
        this.actionManagerContract
            .execute(actionName,
            address, str, intVal, data, 
            (error, result) => {
                if(error) console.error(error);
                callback(str, actionName, result);
            })
    }


    this.addOffer = function(offer, callback){
        this.executeAction("addoffer", "0x0", offer.findId(), offer.computeReward(), offer.toString(), callback);
    };

    this.removeOffer = function(offerName, callback){
        this.executeAction("removeoffer", "0x0", offerName, 0, "", callback);
    }

    this.commitToOffer = function(offerName, callback){
        this.executeAction("committooffer", "0x0", offerName, 0, "", callback);
    }

    this.claimOffer = function(offerName, callback){
        this.executeAction("claimoffer", "0x0", offerName, 0, "", callback);
    }

    this.confirmOffer = function(offerName, callback){
        this.executeAction("confirmoffer", 0x0, offerName, 0, "", callback);
    }


    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync("./abi/" + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    /**
     * Get a list of offer from a list of addresses
     * @param {Object} contractData - Data from the output of epm.yaml
     * @param {Object} contractsManager - The contract manager
     * @param {Array} list - List of 'Element'
     * @param {function} callback 
     */
    function getOfferData (contractData, contractsManager, list, callback) {
        /*Get Offer ABI*/
        let offerContractAddress = contractData["Offer"];
        let offerAbi = JSON.parse(fs.readFileSync("./abi/" + offerContractAddress));

        let offerList = [];
        let size = list.length;

        list.forEach((offer) => {
            let contract = contractsManager.newContractFactory(offerAbi).at(offer.address);

            contract.getData((error, res)=>{
                let oo = new OfferObject(res[0], res[1], res[2], res[3], res[4], res[5], res[6]);
                offerList.push(oo);
                if(offerList.length == size){
                    callback(offerList);
                }
            })
        })
    }

    /**
     * When offerDb have been found on the chain
     * @param {Address} offerDbAddress 
     * @param {Object} contractData 
     * @param {Object} contractsManager 
     * @param {function} callback 
     */
    function onOfferDbFound(offerDbAddress, contractData, contractsManager, callback){
        /*Get OfferDB ABI */
        let offersContractAddress = contractData["deployOffers"];
        let offersAbi = JSON.parse(fs.readFileSync("./abi/" + offersContractAddress));
        let offerContract = contractsManager.newContractFactory(offersAbi).at(offerDbAddress);

        /*Compile offers in list*/
        let list = [];
        
        offerContract.tail(function(error, result){
            var currentKey = result;

            function finished (){
                getOfferData(contractData, contractsManager, list, callback);
            }

            function getElems (key){
                offerContract.getElement(key, function(err, res){
                    let elem = new Element(res[0], res[1], res[2], res[3]);
                    list.push(elem);
                    currentKey = elem.next;
                    let head = list[0];
                    if (currentKey != head.current && currentKey != 0){
                        getElems(currentKey);
                    } else {
                        finished();
                    }
                })
            }
            getElems(currentKey);
        })
    }


    /*Get offers*/
    this.getOffers = function(callback){
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;

        this.dougContract.contracts("offers", (error, offerAddress)=>{
            if(error){
                return null;
            }
            onOfferDbFound(offerAddress, contractData, contractsManager, callback);
        })
    }
}

    



function logOffer(actionName, offerName, result){
    console.log(actionName + ":: OfferName: " + offerName + "-> Result: " + result);
}


module.exports = {
    Offer: Offer,
    OfferManager: OfferManager, 
    logOffer: logOffer
}