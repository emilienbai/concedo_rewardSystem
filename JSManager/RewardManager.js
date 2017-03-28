var erisC = require('eris-contracts');
var fs = require ('fs');

function encrypt(toEncrypt){
    return toEncrypt; //TODO true encryption -> see if code does not depend on count ?
}

function Reward(rewardName, count, timestamp, desription, code){
    this.rewardName = rewardName;
    this.count = count;
    this.timestamp;
    this.description = desription;
    this.encryptedCode = encrypt(code);
}

Reward.prototype.toString = function(){
    return JSON.stringify(this);
}

Reward.prototype.findID = function(){
    return this.rewardName; //TODO hash with count and timestamp
}

function RewardManager(contractManager) {
    /*Get data from deployement*/
    this.contractData = require('../jobs_output.json');

    this.contractsManager = contractManager;
    /*Get ActionManager*/
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

    this.addReward = function(rewardName, price, rewardData, callback){
        this.executeAction("addreward", "0x0", rewardName, price, rewardData, callback);
    };

    this.removeReward = function(rewardName, callback){
        this.executeAction("removereward", "0x0", rewardName, 0, "", callback);
    }

    this.buyReward = function(rewardName, callback){
        this.executeAction("buyreward", 0x0, rewardName, 0, "", callback);
    }

}

function logReward(actionName, offerName, result){
    console.log(actionName + ":: OfferName: " + offerName + "-> Result: " + result);
}

module.exports = {
    Reward : Reward,
    RewardManager : RewardManager,
    logReward: logReward
}