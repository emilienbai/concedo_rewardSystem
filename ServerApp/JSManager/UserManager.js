var erisC = require('eris-contracts');
var fs = require ('fs');
var utils = require('./Utils');
var config = require('../config');


/**
 * Constructor for user
 * @param {String} name - Family name
 * @param {String} surname 
 * @param {String} address 
 * @param {String} phone 
 * @param {String} email 
 */
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

function UserObject(owner, pseudo, perm, encryptedData){
    this.owner = owner;
    this.pseudo = utils.hexToString(pseudo);
    this.perm = perm.toNumber();
    this.encryptedData = utils.hexToString(encryptedData);
}

function Element(prev, next, current, address){
    this.prev = prev;
    this.next = next;
    this.current = current;
    this.address = address;
}


function UserManager(contractsManager) {
    /*Get data from deployement*/
    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractsManager
    /*Get action manager*/
    let actionManagerContractAddress = this.contractData["deployActionManager"];
    let actionManagerAbi = JSON.parse(fs.readFileSync(config.abiDir + actionManagerContractAddress));
    this.actionManagerContract = this.contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);

    /*Get UserDb*/
    let userDbContractAddress = this.contractData["deployUsers"];
    let userDbAbi = JSON.parse(fs.readFileSync(config.abiDir + userDbContractAddress));
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

    this.removeUser =  function(address, callback){
        return this.executeAction("removeuser", address, "", 0, callback);
    }

    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    function getUserData(contractData, contractsManager, list, callback){
        //Get User ABI 
        let userContractAddress = contractData["User"];
        let userAbi = JSON.parse(fs.readFileSync(config.abiDir + userContractAddress));

        let userList = [];
        let size = list.length;

        list.forEach((user)=>{
            if(user.address != 0x0){
                let contract = contractsManager.newContractFactory(userAbi).at(user.address);

                contract.getData((error, res)=>{
                    let uo = new UserObject(res[0], res[1], res[2], res[3]);
                    userList.push(uo);
                    if(userList.length == size){
                        callback(null, userList);
                    }
                })
            } else {
                size--;
                if(userList.length == size){
                    callback(null, userList);
                }
            }   
        })
    }

    function onUserDbFound(userDbAddress, contractData, contractsManager, callback){
        //Get UserDb ABI 
        let usersContractAddress = contractData["deployUsers"];
        let usersABI = JSON.parse(fs.readFileSync(config.abiDir + usersContractAddress));
        let userContract = contractsManager.newContractFactory(userDbAbi).at(usersContractAddress);

        /*Compile offers in list*/
        let list = [];

        userContract.tail(function (error, result) {
            if (error) {
                callback(error, null);
            }
            var currentKey = result;

            function finished() {
                getUserData(contractData, contractsManager, list, callback);
            }

            function getElems(key) {
                userContract.getElement(key, function (err, res) {
                    if (err) {
                        callback(err, null);
                    }
                    let elem = new Element(res[0], res[1], res[2], res[3]);
                    list.push(elem);
                    currentKey = elem.next;
                    let head = list[0];
                    if (currentKey != head.current && currentKey != 0x0) {
                        getElems(currentKey);
                    } else {
                        finished();
                    }
                })
            }
            getElems(currentKey);
        })
    }

    this.getUsers = function(callback){
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        if(callback){
            dougContract.contracts("users", (error, userAddress)=>{
                if(error){
                    return callback(error, null);
                }
                return onUserDbFound(userAddress, contractData, contractsManager, callback);
            })
        } else {
            return new Promise((resolve, reject)=> {
                dougContract.contracts("users", (error, userAddress) => {
                    if (error) return reject(error);
                    onUserDbFound(userAddress, contractData, contractsManager, (error, result) => {
                        if(error) reject(error);
                        resolve(result);
                    })
                })
            })
        }
    }
}

module.exports = {
    User: User,
    UserManager: UserManager
}