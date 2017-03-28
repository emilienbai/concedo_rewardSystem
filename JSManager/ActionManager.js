var erisC = require('eris-contracts');
var fs = require ('fs');

function logResult(action, actionName, res){
        console.log(action + " : " + actionName + " -> " + res);
    }

function ActionManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../jobs_output.json');

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);

/*Get ActionDb*/
    let actionDbContractAdress = this.contractData["deployActionDb"];
    let actionDbAbi = JSON.parse(fs.readFileSync("./abi/" + actionDbContractAdress));
    this.actionDbContract = this.contractsManager.newContractFactory(actionDbAbi).at(actionDbContractAdress);

    /*AddAction Method*/
    this.addAction = function(actionName, deployName, callback) {
        let actionAddress = this.contractData[deployName];

        this.actionManagerContract
            .execute("addaction",
                actionAddress, actionName, 0, "",
                (error, result) => {
                    if (error) console.error(error);
                    callback("AddAction", actionName, result);
                })
    }

    this.removeAction = function(actionName, callback) {
        this.actionManagerContract
            .execute("removeaction", 
            0x0, actionName, 0, "", 
            (error, result) => {
                if(error) console.error(error);
                callback("RemoveAction", actionName, result);
            })
    }

/*Get contract address*/
    this.getActionContractAddress = function(contractName, callback) {
        this.actionDbContract.actions(contractName,
            function(error, result) {
                if (error)
                    console.error(error);
                callback(result);
            });
    }

    this.addAllAction = function(){
    /*Action*/
      this.addAction("removeaction", "deployActionRemoveAction", logResult);  
      /*Users*/
      this.addAction("adduser", "deployActionAddUser", logResult);
      this.addAction("removeuser", "deployActionRemoveUser", logResult);
      /*Offers*/
      this.addAction("addoffer", "deployActionAddOffer", logResult);
      this.addAction("removeoffer", "deployActionRemoveOffer", logResult); 
      this.addAction("committooffer", "deployActionCommitToOffer", logResult);
      this.addAction("claimoffer", "deployActionClaimOffer", logResult);
      this.addAction("confirmoffer", "deployActionConfirmOffer", logResult);
      /*Rewards*/
      this.addAction("addreward", "deployActionAddReward", logResult);
      this.addAction("removereward", "deployActionRemoveReward", logResult);
      this.addAction("buyreward", "deployActionBuyReward", logResult);      
      /*Permissions*/

      /*LockUnlock*/
    }
}

module.exports = {
    ActionManager: ActionManager,
    logResult : logResult
}