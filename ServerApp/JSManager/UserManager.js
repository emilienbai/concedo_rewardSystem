var erisC = require('eris-contracts');
var fs = require('fs');
var perms = require('./PermissionManager');
var utils = require('./Utils');
var config = require('../config');
var aes256 = require('nodejs-aes256');


/**
 * Constructor for user
 * @param {String} name - Family name
 * @param {String} surname 
 * @param {String} birthdate
 * @param {String} address 
 * @param {String} phone 
 * @param {String} email 
 */
function User(name, surname, address, birthdate, phone, email, type) {
    this.name = name;
    this.surname = surname;
    this.birthdate = birthdate;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.type = type;
}

User.prototype.encrypt = function () {
    var ciphertext = aes256.encrypt(config.encryptionPassword, JSON.stringify(this));
    return ciphertext;
}

User.prototype.decrypt = function (encryptedString) {
    var plaintext = aes256.decrypt(config.encryptionPassword, encryptedString);
    let obj = JSON.parse(plaintext);
    this.name = obj.name;
    this.surname = obj.surname;
    this.birthdate = obj.birthdate;
    this.address = obj.address;
    this.phone = obj.phone;
    this.email = obj.email;
    this.type = obj.type;
}

User.prototype.getExpectedPerm = function () {
    switch (this.type) {
        case "volunteer":
            return perms.perms.VOLUNTEER;
        case "elderly":
            return perms.perms.ELDERLY;
        case "rewarder":
            return perms.perms.REWARDER;
        default:
            return 0;
    }
}

function UserObject(owner, pseudo, expectedPerm, perm, encryptedData) {
    this.owner = owner;
    this.pseudo = utils.hexToString(pseudo);
    this.expectedPerm = expectedPerm.toNumber();
    this.perm = perm.toNumber();
    if (encryptedData != undefined) {
        this.encryptedData = encryptedData;
    }
}

function Element(prev, next, current, address) {
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

    this.addUser = function (userAddress, pseudo, user, callback) {
        return this.executeAction("adduser", userAddress, pseudo, user.getExpectedPerm(), user.encrypt(), callback);
    }

    this.removeUser = function (address, callback) {
        return this.executeAction("removeuser", address, "", 0, callback);
    }

    this.getFullUser = function (userAddress, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;
        if (callback) getUser(contractData, contractsManager, dougContract, userAddress, true, callback);
        else {
            return new Promise((resolve, reject) => {
                getUser(contractData, contractsManager, dougContract, userAddress, true, (error, user) => {
                    if (error) reject(error);
                    resolve(user);
                })
            })
        }
    }

    this.getPseudoUser = function (userAddress, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;
        if (callback) getUser(contractData, contractsManager, dougContract, userAddress, false, callback);
        else {
            return new Promise((resolve, reject) => {
                getUser(contractData, contractsManager, dougContract, userAddress, false, (error, user) => {
                    if (error) reject(error);
                    resolve(user);
                })
            })
        }
    }

    this.getUsers = function (callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        if (callback) {
            return getUserDbAddress(dougContract)
                .then(userDbAddress => {
                    return getElemList(userDbAddress, contractData, contractsManager, false, callback);
                })
                .catch(error => {
                    callback(error, null);
                })
        } else {
            return new Promise((resolve, reject) => {
                return getUserDbAddress(dougContract)
                    .then(userDbAddress => {
                        getElemList(userDbAddress, contractData, contractsManager, false, (error, result) => {
                            if (error) reject(error);
                            resolve(result);
                        })
                    })
                    .catch(error => {
                        reject(error);
                    })
            })
        }
    }

    this.getUnauthorizedUsers = function (callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        if (callback) getUnauthorizedUsers(contractData, contractsManager, dougContract, callback);
        else {
            return new Promise((resolve, reject) => {
                getUnauthorizedUsers(contractData, contractsManager, dougContract, (error, users) => {
                    if (error) reject(error);
                    resolve(users);
                })
            })
        }
    }

    function getUnauthorizedUsers(contractData, contractsManager, dougContract, callback) {
        return getUserDbAddress(dougContract)
            .then(userDbAddress => {
                getElemList(userDbAddress, contractData, contractsManager, true, (error, result) => {
                    let ArrRes = [];
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].perm == 0) {
                            let u = new User();
                            u.decrypt(utils.hexToString(result[i].encryptedData));
                            ArrRes.push({
                                "owner": result[i].owner,
                                "pseudo": result[i].pseudo,
                                "expectedPerm": result[i].expectedPerm,
                                "perm": result[i].perm,
                                "user": JSON.stringify(u)
                            })
                        }
                    }
                    callback(error, ArrRes);
                })
            })
    }


    function getUser(contractData, contractsManager, dougContract, userAddress, full, callback) {
        return getUserDbAddress(dougContract)
            .then(userDbAddress => {
                return getUserContractAddress(userAddress, userDbAddress, contractData, contractsManager)
            })
            .then(userElem => {
                return getUserData(contractData, contractsManager, [userElem], true, (error, userList) => {
                    if (userList[0]) {
                        if (full) {
                            let u = new User("", "", "", "", "", "");
                            u.decrypt(utils.hexToString(userList[0].encryptedData));
                            return callback(null, u);
                        } else {
                            return callback(null, userList[0]);
                        }
                    } else {
                        return callback(null, null);
                    }
                })
            })
            .catch(error => {
                callback(error, null);
            })
    }

    function getUserDbAddress(dougContract) {
        return new Promise((resolve, reject) => {
            dougContract.contracts("users", (error, userDbAddress) => {
                if (error) reject(error);
                resolve(userDbAddress);
            })
        })
    }

    function getUserContractAddress(userAddress, userDbAddress, contractData, contractsManager) {
        let usersContractsAddress = contractData["deployUsers"];
        let usersAbi = JSON.parse(fs.readFileSync(config.abiDir + usersContractsAddress));
        let usersContract = contractsManager.newContractFactory(usersAbi).at(userDbAddress);

        return new Promise((resolve, reject) => {
            usersContract.getElement(userAddress, (error, res) => {
                if (error) reject(error);
                resolve(new Element(res[0], res[1], res[2], res[3]));
            })
        })

    }


    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    function getUserData(contractData, contractsManager, list, fullUser, callback) {
        //Get User ABI 
        let userContractAddress = contractData["User"];
        let userAbi = JSON.parse(fs.readFileSync(config.abiDir + userContractAddress));

        let userList = [];
        let size = list.length;

        list.forEach((user) => {
            if (user.address != 0x0) {
                let contract = contractsManager.newContractFactory(userAbi).at(user.address);

                contract.getData((error, res) => {
                    let uo;
                    if (fullUser) {
                        uo = new UserObject(res[0], res[1], res[2], res[3], res[4]);
                    } else {
                        uo = new UserObject(res[0], res[1], res[2], res[3], undefined);
                    }
                    userList.push(uo);
                    checkList();

                })
            } else {
                size--;
                checkList();
            }
        })

        function checkList() {
            if (userList.length == size) {
                callback(null, userList);
            }
        }
    }

    function getElemList(userDbAddress, contractData, contractsManager, fullUser, callback) {
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
                getUserData(contractData, contractsManager, list, fullUser, callback);
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
}

module.exports = {
    User: User,
    UserManager: UserManager
}