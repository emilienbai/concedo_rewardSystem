var erisC = require('eris-contracts');
var fs = require ('fs');

function logAddActionResult(actionName, res){
        console.log("AddAction : " + actionName + " -> " + res);
    }

function ActionManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('./jobs_output.json');

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
                    if (!result) callback(actionName, false)
                    else {
                        //Check equality
                        this.getActionContractAddress(actionName, (chainAddress) => {
                            if (chainAddress != actionAddress)
                                callback(actionName, false);
                            else
                                callback(actionName, true);
                        })
                    }
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
      //this.addAction("adduser", "deployActionAddUser", logAddActionResult);
      //this.addAction("removeuser", "deployActionRemoveUser", logAddActionResult);
      this.addAction("addoffer", "deployActionAddOffer", logAddActionResult);
      //this.addAction("removeoffer", "deployActionRemoveOffer", logAddActionResult); 
      this.addAction("committooffer", "deployActionCommitToOffer", logAddActionResult);
      this.addAction("claimoffer", "deployActionClaimOffer", logAddActionResult);
      this.addAction("confirmoffer", "deployActionConfirmOffer", logAddActionResult);  
    }
}

module.exports = {
    ActionManager: ActionManager
}