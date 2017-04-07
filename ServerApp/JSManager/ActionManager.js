var erisC = require('eris-contracts');
var fs = require('fs');
var config = require('../config');

function ActionManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync(config.abiDir + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);

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

    this.clear = function (callback){
        return this.executeAction("clear", 0x0, "", 0, "", callback);
    }

    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    function onActionDbFound(actionName, actionDbAddress, contractData, contractsManager, callback) {
        let actionsContractAddress = contractData["deployActionDb"];
        let actionsAbi = JSON.parse(fs.readFileSync(config.abiDir + actionsContractAddress));
        let actionsContract = contractsManager.newContractFactory(actionsAbi).at(actionDbAddress);

        actionsContract.getPermission(actionName, (error, result)=>{
                if(error) callback(error, null);
                callback(null, result.toNumber());
            })
    }

    this.getActionPerm = function (actionName, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        if (callback) {
            dougContract.contracts("actiondb", (error, actionDbAddress) => {
                if (error) callback(error, null);
                onActionDbFound(actionName, actionDbAddress, contractData, contractsManager, callback);
            })
        } else {
            return new Promise((resolve, reject) => {
                dougContract.contracts("actiondb", (error, actionDbAddress) => {
                    onActionDbFound(actionName, actionDbAddress, contractData, contractsManager, (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    })
                })
            })
        }
    }

    this.addAllAction = function (verbose) {
        var allPassed;
        return new Promise((resolve, reject) => {
            //Action
            this.addAction("removeaction", "deployActionRemoveAction")
                .then((result) => {
                    allPassed = result;
                    if (verbose) console.log("AddAction :: Remove Action -> " + result);
                    return this.addAction("adduser", "deployActionAddUser");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Add User -> " + result);
                    return this.addAction("removeuser", "deployActionRemoveUser");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Remove User -> " + result);
                    return this.addAction("addoffer", "deployActionAddOffer");
                })
                .then((result) => {
                    if (verbose) console.log("AddAction :: Add Offer -> " + result);
                    return this.addAction("removeoffer", "deployActionRemoveOffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Remove Offer -> " + result);
                    return this.addAction("committooffer", "deployActionCommitToOffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Commit to Offer -> " + result);
                    return this.addAction("claimoffer", "deployActionClaimOffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Claim Offer -> " + result);
                    return this.addAction("confirmoffer", "deployActionConfirmOffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Confirm Offer -> " + result);
                    return this.addAction("addreward", "deployActionAddReward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Add Reward -> " + result);
                    return this.addAction("removereward", "deployActionRemoveReward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Remove Reward -> " + result);
                    return this.addAction("buyreward", "deployActionBuyReward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Buy Reward -> " + result);
                    return this.addAction("setuserpermission", "deployActionSetUsermPerm");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Set User Permission -> " + result);
                    return this.addAction("setactionpermission", "deployActionSetActionPerm");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("AddAction :: Set Action Permission -> " + result);
                    return resolve(allPassed);
                }),
                (undefined, reject);
        })
    }

    this.removeAllAction = function (verbose) {
        var allPassed;
        return new Promise((resolve, reject) => {
            //Action
            this.removeAction("setuserpermission")
                .then((result) => {
                    allPassed = result;
                    if (verbose) console.log("RemoveAction :: Set User Permission Action -> " + result);
                    return this.removeAction("adduser");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Add User -> " + result);
                    return this.removeAction("removeuser");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Remove User -> " + result);
                    return this.removeAction("addoffer");
                })
                .then((result) => {
                    if (verbose) console.log("RemoveAction :: Add Offer -> " + result);
                    return this.removeAction("removeoffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Remove Offer -> " + result);
                    return this.removeAction("committooffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Commit to Offer -> " + result);
                    return this.removeAction("claimoffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Claim Offer -> " + result);
                    return this.removeAction("confirmoffer");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Confirm Offer -> " + result);
                    return this.removeAction("addreward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Add Reward -> " + result);
                    return this.removeAction("removereward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Remove Reward -> " + result);
                    return this.removeAction("buyreward");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Buy Reward -> " + result);
                    return this.removeAction("setactionpermission");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Set Action Permission -> " + result);
                    return this.removeAction("removeaction");
                })
                .then((result) => {
                    allPassed = allPassed && result;
                    if (verbose) console.log("RemoveAction :: Remove Action -> " + result);
                    return resolve(allPassed);
                }),
                (undefined, reject);
        })
    }
}

module.exports = {
    ActionManager: ActionManager,
}