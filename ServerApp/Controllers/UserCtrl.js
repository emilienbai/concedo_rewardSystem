var bankManager = require('../JSManager/BankManager');
var offerManager = require('../JSManager/OfferManager');
var rewardManager = require('../JSManager/RewardManager');
var accountManager = require('../JSManager/AccountManager');
var userManager = require('../JSManager/UserManager');
var permManager = require('../JSManager/PermissionManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var erisC = require('eris-contracts');

var erisdbURL = config.erisdbURL;

function checkUser(u) {
    if (!u.pseudo || !u.name || !u.surname || !u.address || !u.phone || !u.email || !u.birthdate) {
        throw ({ error: "Missing argument in user" });
    }
}

function getBalance(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let bManager = new bankManager.BankManager(contractManager);

        bManager.getBalance(request.params.userAddress)
            .then((result) => {
                response.status(200).json({
                    balance: result
                });
            })
    } catch (error) {
        response.status(400).json(error);
    }
}

function getUsers(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let uManager = new userManager.UserManager(contractManager);
        uManager.getUsers()
            .then((result) => {
                response.status(200).json(result);
            })

    } catch (error) {
        response.status(400).json(error);
    }
}

function getUserOffers(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let oManager = new offerManager.OfferManager(contractManager);
        if (!request.params.userAddress)
            throw ({ error: "missing user address in params" })
        if (request.params.userAddress != request.headers.address) {
            throw ({ error: "Not allowed to see someone else offers" });
        } 
        oManager.getUserOffers(request.params.userAddress)
            .then((result) => {
                response.status(200).json(result);
            })
    } catch (error) {
        response.status(400).json(error);
    }
}

function getUserRewards(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rManager = new rewardManager.RewardManager(contractManager);
        if (!request.params.userAddress)
            throw ({ error: "missing user address in params" })
        rManager.getUserRewards(request.params.userAddress)
            .then((result) => {
                response.status(200).json(result);
            })
    } catch (error) {
        response.status(400).json(error);
    }
}

function addUser(request, response) {

    try {
        let u = request.body.user;
        checkUser(u);
        accountManager.addAccount()
            .then((credentials) => {
                creds = credentials;
                let contractManager = erisC.newContractManagerDev(erisdbURL, credentials);
                let uManager = new userManager.UserManager(contractManager);
                let uData = new userManager.User(u.name, u.surname, u.birthdate, u.address, u.phone, u.email, u.type);
                //for wallah testing - Rewarder user

                creds = {
                    address: "DFE8A4EFF35193479BE8A230CE0BD1546ABD1A83",
                    pubKey: "044A85C207F4245D72AED37A2B68B4A3E23BA67B593469B7C11261421AAE6D03",
                    privKey: "24CBB3D74E2CBA47CFC801B35797E71CB6759677D3625A474B91E6DEEBEC3294044A85C207F4245D72AED37A2B68B4A3E23BA67B593469B7C11261421AAE6D03"
                }

                /*
                                response.status(200).json({
                                    added: true,
                                    credentials: creds
                                    
                                })
                            })
                */
                //for wallah testing - Volunteer user
                /*
                creds = {
                    address: "BC350BC65E67C782284FAFC02DBABDF6CFE6FBCC",
                    pubKey: "8FF72D82DD9AB54EEEB1F5419486A3E5D4940A51D94BC96D796BC6A23A3EE47A",
                    privKey: "41CCA822A0249586FA0E3A05A8378758B403474310EBD0A7BBACC05066ABE9758FF72D82DD9AB54EEEB1F5419486A3E5D4940A51D94BC96D796BC6A23A3EE47A"
                }
                
                
                                response.status(200).json({
                                    added: true,
                                    credentials: creds
                                    
                                })
                            })
                
                */
                //for wallah testing - Elderly user

                /*
                creds = {
                    address: "CC271557637EB728FE1D660CB92192F398D2980B",
                    pubKey: "D443CDBA39602D77E804C329A7F6AFA19BD8468695124FDB85151093E295DA99",
                    privKey: "BD21438C1A29AA688FD73CAA120CE04FF49B997B0C837C212AEA781847381BC1D443CDBA39602D77E804C329A7F6AFA19BD8468695124FDB85151093E295DA99"
                };
                */
                /*
                                response.status(200).json({
                                    added: true,
                                    credentials: creds
                                })
                
                            })
                */



                //For true testing
                return uManager.addUser(creds.address, u.pseudo, uData)
            }).then((result) => {
                console.log(creds);
                response.status(200).json({
                    added: result,
                    credentials: creds
                })
            })
            .catch((error) => {
                throw (error);
            })


    } catch (error) {
        response.status(400).json(error);
    }
}



function setUserPermission(request, response) {
    try {
        if (!request.params.userAddress || !request.body.perm)
            throw ({ error: "missing user address in params or perm level in body" })

        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let pManager = new permManager.PermisssionManager(contractManager);
        return pManager.setUserPermission(request.params.userAddress, request.body.perm)
            .then((result) => {
                response.status(200).json({
                    permSet: result
                })
            }).catch((error) => {
                throw (error);
            })
    } catch (error) {
        response.status(400).json(error);
    }
}


module.exports = {
    getBalance: getBalance,
    getUserOffers: getUserOffers,
    getUserRewards: getUserRewards,
    addUser: addUser,
    setUserPermission: setUserPermission,
    getUsers: getUsers
}