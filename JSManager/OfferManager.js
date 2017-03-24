var erisC = require('eris-contracts');
var fs = require ('fs');

function Offer(offerName, period, duration, type, description, option){
    this.offerName = offerName;
    this.period = period;
    this.duration = duration;
    this.type = type;
    this.description = description;
    this.option = option;
}

Offer.prototype.toString = function(){
    return JSON.stringify(this);
}

Offer.prototype.findId = function(){
    return this.offerName; //TODO make hash with offerName+time
}

function OfferManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('./jobs_output.json');

    this.contractsManager = contractsManager
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


    this.addOffer = function(offerName, reward, offerData, callback){
        this.executeAction("addoffer", "0x0", offerName, reward, offerData, callback);
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
}

function logOffer(actionName, offerName, result){
    console.log(actionName + ":: OfferName: " + offerName + "-> Result: " + result);
}


module.exports = {
    Offer: Offer,
    OfferManager: OfferManager, 
    logOffer: logOffer
}