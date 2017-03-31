var erisC = require('eris-contracts');
var fs = require ('fs');

function User(name, surname, address, phone, email){
    this.name = name;
    this.surname = surname;
    this.address = address;
    this.phone = phone;
    this.email = email;
}

User.prototype.encrypt = function(){
    return JSON.stringify(this); //TODO true encryption
}

function UserManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../jobs_output.json');

    this.contractsManager = contractsManager
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);

    /*Get UserDb*/
    let userDbContractAddress = this.contractData["deployUsers"];
    let userDbAbi = JSON.parse(fs.readFileSync("./abi/" + userDbContractAddress));
    this.userDbContract = this.contractsManager.newContractFactory(userDbAbi).at(userDbContractAddress);

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

    this.addUser = function(userAddress, pseudo, userData, callback){
        return this.executeAction("adduser", userAddress, pseudo, 0, userData, callback);
    }

    this.removeUser =  function(userAddress, callback){
        return this.executeAction("removeuser", userAddress, "", 0, callback);
    }
}

module.exports = {
    User: User,
    UserManager: UserManager
}