var erisC = require('eris-contracts');
var fs = require('fs');

var perms = {
    ALL: 0,
    VOLUNTEER: 10,
    ELDERLY: 20,
    REWARDER: 30,
    ADMIN: 40,
    FULL: 255
}

function PermissionManager(contractsManager) {
    /*GetData from deployment*/
    this.contractData = require("../jobs_output.json");

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
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

    this.setUserPermission = function (userAddress, permission, callback) {
        return this.executeAction("setuserpermission", userAddress, "", permission, "", callback);
    }

    this.setActionPermission = function (actionName, permission, callback) {
        return this.executeAction("setactionpermission", 0x0, actionName, permission, "", callback);
    }

    this.setAllActionPerm = function () {
        return new Promise((resolve, reject) => {
            this.setActionPermission("addaction", perms.ADMIN)
                .then((result) => {
                    console.log("Set Action Perm :: addaction " + perms.ADMIN + " -> " + result);
                    return this.setActionPermission("removeaction", perms.ADMIN);
                })
                .then((result) => {
                    console.log("Set Action Perm :: removeaction " + perms.ADMIN + " -> " + result);
                    return this.setActionPermission("adduser", perms.ALL);
                })
                .then((result) => {
                    console.log("Set Action Perm :: adduser " + perms.ALL + " -> " + result);
                    return this.setActionPermission("removeuser", perms.ADMIN);
                })
                .then((result) => {
                    console.log("Set Action Perm :: removeuser " + perms.ADMIN + " -> " + result);
                    return this.setActionPermission("addoffer", perms.ELDERLY);
                })
                .then((result) => {
                    console.log("Set Action Perm :: addoffer " + perms.ELDERLY + " -> " + result);
                    return this.setActionPermission("removeoffer", perms.ELDERLY);
                })
                .then((result) => {
                    console.log("Set Action Perm :: removeoffer " + perms.ELDERLY + " -> " + result);
                    return this.setActionPermission("committooffer", perms.VOLUNTEER);
                })
                .then((result) => {
                    console.log("Set Action Perm :: committooffer " + perms.VOLUNTEER + " -> " + result);
                    return this.setActionPermission("claimoffer", perms.VOLUNTEER);
                })
                .then((result) => {
                    console.log("Set Action Perm :: claimoffer " + perms.VOLUNTEER + " -> " + result);
                    return this.setActionPermission("confirmoffer", perms.ELDERLY);
                })
                .then((result) => {
                    console.log("Set Action Perm :: confirmoffer " + perms.ELDERLY + " -> " + result);
                    return this.setActionPermission("addreward", perms.REWARDER);
                })
                .then((result) => {
                    console.log("Set Action Perm :: addreward " + perms.REWARDER + " -> " + result);
                    return this.setActionPermission("removereward", perms.REWARDER);
                })
                .then((result) => {
                    console.log("Set Action Perm :: removereward " + perms.REWARDER + " -> " + result);
                    return this.setActionPermission("buyreward", perms.VOLUNTEER);
                })
                .then((result) => {
                    console.log("Set Action Perm :: buyreward " + perms.VOLUNTEER + " -> " + result);
                    return this.setActionPermission("setuserpermission", perms.ADMIN);
                })
                .then((result) => {
                    console.log("Set Action Perm :: setuserpermission " + perms.ADMIN + " -> " + result);
                    return this.setActionPermission("setactionpermission", perms.ADMIN);
                })
                .then((result) => {
                    console.log("Set Action Perm :: setactionpermission " + perms.ADMIN + " -> " + result);
                    return resolve();
                }),
                (undefined, reject);
        })
    }
}

module.exports = {
    perms: perms,
    PermisssionManager: PermissionManager,
}