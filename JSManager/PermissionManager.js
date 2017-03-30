var erisC = require('eris-contracts');
var fs = require ('fs');

var perms = {
    VOLUNTEER : 10, 
    ELDERLY : 20,
    REWARDER : 30,
    ADMIN : 40,
    FULL : 255
}

function logResult(action, actionOrUser, permValue, res){
        console.log(action + " : PermValue: " + permValue + ", "+ actionOrUser + " -> " + res);
    }

function PermissionManager(contractsManager){
    /*GetData from deployment*/
    this.contractData = require("../jobs_output.json");

    this.contractsManager = contractsManager;
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


    this.setUserPermission = function(userAddress, permission, callback){
        this.actionManagerContract
            .execute("setuserpermission", userAddress, "", permission, "", 
            (error, result)=>{
                if(error) console.error(error);
                callback("SetUserPerm", userAddress, permission, result);
            })
    }

    this.setActionPermission = function(actionName, permission, callback){
        this.actionManagerContract
            .execute("setactionpermission", 0x0, actionName, permission, "", 
            (error, result)=>{
                if(error) console.error(error);
                callback("SetActionPerm", actionName, permission, result);
            })
    }

    this.setAllActionPerm = function(){
        //Actions
        this.setActionPermission("addAction", perms.ADMIN, logResult);        
        this.setActionPermission("removeaction", perms.ADMIN, logResult);

        //Users
        this.setActionPermission("adduser", perms.ADMIN, logResult);
        this.setActionPermission("removeuser", perms.ADMIN, logResult);
        //Offers
        this.setActionPermission("addoffer", perms.ELDERLY, logResult);
        this.setActionPermission("removeoffer", perms.ELDERLY, logResult);
        this.setActionPermission("committooffer", perms.VOLUNTEER, logResult);
        this.setActionPermission("claimoffer", perms.VOLUNTEER, logResult);
        this.setActionPermission("confirmoffer", perms.ELDERLY, logResult);

        //Rewards
        this.setActionPermission("addreward", perms.REWARDER, logResult);
        this.setActionPermission("removereward", perms.REWARDER, logResult);
        this.setActionPermission("buyreward", perms.VOLUNTEER, logResult);

        //Permissions
        this.setActionPermission("setuserpermission", perms.ADMIN, logResult);
        this.setActionPermission("setactionpermission", perms.ADMIN, logResult);
    }




}

module.exports = {
    perms : perms,
    PermisssionManager : PermissionManager, 
    logResult: logResult
}