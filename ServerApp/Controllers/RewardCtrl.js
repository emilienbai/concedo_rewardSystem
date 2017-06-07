var rewardManager = require('../JSManager/RewardManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var burrowC = require('@monax/legacy-contracts');

var erisdbURL = config.erisdbURL;

function checkReward(r) {
    if (!r.name || !r.price || !r.count || !r.description || !r.code) {
        throw ({ error: "Missing argument in reward" });
    }
}

function createReward(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        let r = request.body.reward;
        checkReward(r);
        var d = new Date();
        let rIdArray = [];
        let countGoal = r.count;
        for (var i = 0; i < r.count; i++) {
            let reward = new rewardManager.Reward(r.name, r.price, i, d.toString(), r.description, r.code);

            rmanager.addReward(reward)
                .then((result) => {
                    if (result) {
                        rIdArray.push(reward.findId());
                        checkIfDone();
                    } else {
                        countGoal--;
                        checkIfDone();
                    }
                })
        }
        function checkIfDone() {
            if (rIdArray.length == countGoal) {
                response.status(201).json({
                    rewardId: rIdArray
                })
            }
        }
    } catch (error) {
        response.status(400).send(error);
    }
}

function removeReward(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.removeReward(request.params.rewardId)
            .then((result) => {
                response.status(200).json({
                    removed: result
                })
            })
    } catch (error) {
        response.status(400).send({ error: error });
    }
}

function buyReward(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.buyReward(request.params.rewardId)
            .then((result) => {
                let code = "";
                if (result) {
                    rmanager.getReward(request.params.rewardId)
                        .then(rewardObject => {
                            rewardObject.data.decrypt();
                            code = rewardObject.data.code;

                            response.status(200).json({
                                bought: result,
                                code: code
                            })

                        })
                } else {
                    response.status(200).json({
                        bought: result,
                        code: code
                    })
                }

            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getRewards(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        rmanager.getRewards(request.params.available === "true")
            .then((result) => {
                rewardManager.removeCode(result);
                response.status(200).json(result)
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getReward(request, response) {
    try {
        let contractManager = burrowC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let rmanager = new rewardManager.RewardManager(contractManager);
        if (!request.params.rewardId) throw ({ error: "Missing reward ID" })
        rmanager.getReward(request.params.rewardId)
            .then((result) => {
                if(result.rewarder == request.headers.address || result.buyer == request.headers.address){
                    result.data.decrypt();
                }else {
                    result.data.code = "";
                }
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