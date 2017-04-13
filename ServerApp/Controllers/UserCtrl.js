var bankManager = require('../JSManager/BankManager');
var offerManager = require('../JSManager/OfferManager');
var rewardManager = require('../JSManager/RewardManager');
var accountManager = require('../JSManager/AccountManager');
var userManager = require('../JSManager/UserManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var erisC = require('eris-contracts');

var erisdbURL = config.erisdbURL;

function checkUser(u) {
    if (!u.pseudo || !u.name || !u.surname || !u.address || !u.phone || !u.email) {
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

function getUserOffers(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let oManager = new offerManager.OfferManager(contractManager);
        if (!request.params.userAddress)
            throw ({ error: "missing user address in params" })
        //TODO : maybe check that credential and params are equals
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
        let creds;
        accountManager.addAccount()
            .then((credentials) => {
                creds = credentials;
                let contractManager = erisC.newContractManagerDev(erisdbURL, credentials);
                let uManager = new userManager.UserManager(contractManager);
                let uData = new userManager.User(u.name, u.surname, u.address, u.phone, u.email, u.type);
                return uManager.addUser(credentials.address, u.pseudo, uData)
            }).then((result) => {
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

module.exports = {
    getBalance: getBalance,
    getUserOffers: getUserOffers,
    getUserRewards: getUserRewards,
    addUser: addUser
}