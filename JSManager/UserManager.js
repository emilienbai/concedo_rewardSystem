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



    this.addUser = function(userAddress, pseudo, userData, callback){
        this.actionManagerContract
            .execute("adduser",
            userAddress, pseudo, 0, userData, 
            (error, result) => {
                if(error) console.error(error);
                callback(pseudo, result);
            }
        )
    }

    this.removeUser =  function(userAddress, callback){
        this.actionManagerContract
            .execute("removeuser",
            userAddress, "", 0, "",
            (error, result) => {
                if(error) console.error(error);
                callback(userAddress, result);
            })
    }

//TODO A true get for user using constant methods
    this.getUserAddress = function(address, callback){
        this.userDbContract.users(address, function(error, result){
            if(error)
                console.log(error);
            callback(address, result);
        })
    }
}

function logAddUser(pseudo, result){
    console.log("AddUser:: Pseudo: " + pseudo + "-> Result: " + result);
}

function logRemoveUser(userAddress, result){
    console.log("RemoveUser:: Address: " + userAddress + "-> Result: " + result);
}

function logGetUserAddress(userAddress, result){
    console.log("GetUserAddress:: Address: " + userAddress + "-> Result: "+ result);
}


module.exports = {
    User: User,
    UserManager: UserManager, 
    logAddUser: logAddUser, 
    logRemoveUser: logRemoveUser,
    logGetUserAddress: logGetUserAddress
}