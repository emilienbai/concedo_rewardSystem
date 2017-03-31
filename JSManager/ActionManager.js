var erisC = require('eris-contracts');
var fs = require('fs');

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


    this.executeAction = function (actionName, address, str, intVal, data, callback) {
        if (callback) {
            return this.actionManagerContract
                .execute(actionName, address, str, intVal, data, callback)
        }
        let amc = this.actionManagerContract;
        return new Promise((resolve, reject) => {
            amc.execute(actionName,
                address, str, intVal, data,
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                })
        })

    }

    /*AddAction Method*/
    this.addAction = function (actionName, deployName, callback) {
        let actionAddress = this.contractData[deployName];
        return this.executeAction("addaction", actionAddress, actionName, 0, "", callback);
    }

    this.removeAction = function (actionName, callback) {
        return this.executeAction("removeaction", 0x0, actionName, 0, "", callback);
    }

    /*Get contract address*/
    this.getActionContractAddress = function (contractName, callback) {
        this.actionDbContract.actions(contractName,
            function (error, result) {
                if (error)
                    console.error(error);
                callback(result);
            });
    }

    this.addAllAction = function () {
        return new Promise((resolve, reject) => {
            //Action
            this.addAction("removeaction", "deployActionRemoveAction")
                .then((result) => {
                    console.log("AddAction :: Remove Action -> " + result);
                    return this.addAction("adduser", "deployActionAddUser")
                })
                .then((result) => {
                    console.log("AddAction :: Add User -> " + result);
                    return this.addAction("removeuser", "deployActionRemoveUser")
                })
                .then((result) => {
                    console.log("AddAction :: Remove User -> " + result);
                    return this.addAction("addoffer", "deployActionAddOffer");
                })
                .then((result) => {
                    console.log("AddAction :: Add Offer -> " + result);
                    return this.addAction("removeoffer", "deployActionRemoveOffer");
                })
                .then((result) => {
                    console.log("AddAction :: Remove Offer -> " + result);
                    return this.addAction("committooffer", "deployActionCommitToOffer");
                })
                .then((result) => {
                    console.log("AddAction :: Commit to Offer -> " + result);
                    return this.addAction("claimoffer", "deployActionClaimOffer");
                })
                .then((result) => {
                    console.log("AddAction :: Claim Offer -> " + result);
                    return this.addAction("confirmoffer", "deployActionConfirmOffer");
                })
                .then((result) => {
                    console.log("AddAction :: Confirm Offer -> " + result);
                    return this.addAction("addreward", "deployActionAddReward");
                })
                .then((result) => {
                    console.log("AddAction :: Add Reward -> " + result);
                    return this.addAction("removereward", "deployActionRemoveReward");
                })
                .then((result) => {
                    console.log("AddAction :: Remove Reward -> " + result);
                    return this.addAction("buyreward", "deployActionBuyReward");
                })
                .then((result) => {
                    console.log("AddAction :: Buy Reward -> " + result);
                    return this.addAction("setuserpermission", "deployActionSetUsermPerm");
                })
                .then((result) => {
                    console.log("AddAction :: Set User Permission -> " + result);
                    return this.addAction("setactionpermission", "deployActionSetActionPerm");
                })
                .then((result) => {
                    console.log("AddAction :: Set Action Permission -> " + result);
                    return resolve();
                }),
                (undefined, reject);
        })
    }
}

module.exports = {
    ActionManager: ActionManager,
}