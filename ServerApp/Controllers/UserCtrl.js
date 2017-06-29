var bankManager = require('../JSManager/BankManager');
var offerManager = require('../JSManager/OfferManager');
var rewardManager = require('../JSManager/RewardManager');
var accountManager = require('../JSManager/AccountManager');
var userManager = require('../JSManager/UserManager');
var permManager = require('../JSManager/PermissionManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var burrowC = require('@monax/legacy-contracts');

var erisdbURL = config.erisdbURL;

function checkUser(u) {
    if (!u.pseudo || !u.name || !u.surname || !u.address || !u.phone || !u.email || !u.birthdate) {
        throw ({ error: "Missing argument in user" });
    }
}

function getBalance(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
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
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let uManager = new userManager.UserManager(contractManager);
        uManager.getUsers()
            .then((result) => {
                response.status(200).json(result);
            })

    } catch (error) {
        response.status(400).json(error);
    }
}

function getUser(request, response) {
    try {
        if (!request.params.userAddress)
            throw ({ error: "missing user address in params" });
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let uManager = new userManager.UserManager(contractManager);
        return uManager.getPseudoUser(request.headers.address)
            .then(userObject => {
                if (userObject == null) {
                    return response.status(404).json({ error: "User not found" });
                }
                if (userObject.perm >= permManager.perms.ADMIN || userObject.owner == request.params.userAddress)
                    return uManager.getFullUser(request.params.userAddress)
                        .then(result => {
                            return response.status(200).json(result);
                        })
                else {
                    return response.status(401).json({ error: "Unauthorized Request" });
                }
            })
    } catch (error) {
        return response.status(400).json(error);
    }
}

function getUnauthorizedUsers(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let uManager = new userManager.UserManager(contractManager);
        return uManager.getPseudoUser(request.headers.address)
            .then(userObject => {
                if (userObject.perm >= permManager.perms.ADMIN)
                    return uManager.getUnauthorizedUsers();
                else {
                    response.status(401).json({ error: "Unauthorized Request" });
                }
            })
            .then(result => {
                response.status(200).json(result);
            })
    } catch (error) {
        response.status(400).json(error);
    }
}

function getUserOffers(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
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
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
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
                let contractManager = burrowC.newContractManagerDev(erisdbURL, credentials);
                let uManager = new userManager.UserManager(contractManager);
                let uData = new userManager.User(u.name, u.surname, u.address, u.birthdate, u.phone, u.email, u.type);
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

        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
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
    getUsers: getUsers,
    getUser: getUser,
    getUnauthorizedUsers: getUnauthorizedUsers
}