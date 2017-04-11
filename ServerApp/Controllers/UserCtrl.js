var bankManager = require('../JSManager/BankManager');
var offerManager = require('../JSManager/OfferManager');
var rewardManager = require('../JSManager/RewardManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var erisC = require('eris-contracts');

var erisdbURL = config.erisdbURL;

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
        .then((result)=>{
            response.status(200).json(result);
        })
    } catch(error){
        response.status(400).json(error);
    }
}

module.exports = {
    getBalance: getBalance,
    getUserOffers: getUserOffers,
    getUserRewards: getUserRewards
}