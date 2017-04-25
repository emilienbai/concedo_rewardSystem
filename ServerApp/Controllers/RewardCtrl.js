var rewardManager = require('../JSManager/RewardManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var erisC = require('eris-contracts');

var erisdbURL = config.erisdbURL;

function checkReward(r) {
    if (!r.rewardName || !r.price || !r.count || !r.description || !r.code) {
        throw ({ error: "Missing argument in reward" });
    }
}

function createReward(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        let r = request.body.reward;
        checkReward(r);
        var d = new Date();
        let reward = new rewardManager.Reward(r.rewardName, r.price, r.count, d.toString(), r.description, r.code);

        rmanager.addReward(reward)
            .then((result) => {
                if (result) {
                    response.status(201).json({
                        rewardId: reward.findId()
                    })
                } else {
                    response.status(401).send('Error while adding reward');
                }
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function removeReward(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.removeReward(request.params.rewardId)
            .then((result) => {
                response.status(200).json({
                    removed: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function buyReward(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.buyReward(request.params.rewardId)
            .then((result) => {
                response.status(200).json({
                    bought: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getRewards(request, response) {//todo improve
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        rmanager.getRewards(request.params.available==="true")
            .then((result) => {
                response.status(200).json(result)
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getReward(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.getReward(request.params.rewardId)
            .then((result) => {
                response.status(200).json(result)
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

module.exports = {
    createReward: createReward,
    removeReward: removeReward,
    buyReward: buyReward,
    getReward: getReward,
    getRewards: getRewards
}