var offerManager = require('../JSManager/OfferManager');
var utils = require('../JSManager/Utils');
var config = require('../config');
var erisC = require('eris-contracts');

var erisdbURL = config.erisdbURL;

function checkOffer(o) {
    if (!o.offerName || !o.period || !o.duration
        || !o.location || !o.type || !o.description || !o.option) {
        throw ({ error: "Missing argument in offer" });
    }
}

function createOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        let o = request.body.offer;
        checkOffer(o);
        let offer = new offerManager.Offer(o.offerName, o.period, o.duration, o.location, o.type, o.description, o.option);

        omanager.addOffer(offer)
            .then((result) => {
                if (result) {
                    response.status(201).json({
                        offerId: offer.findId()
                    })
                } else {
                    response.status(401).send('Error while adding offer');
                }
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function removeOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        if (!request.params.offerId) throw ({ error: "Missing offer ID" })
        omanager.removeOffer(request.params.offerId)
            .then((result) => {
                response.status(200).json({
                    removed: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function commitToOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        if (!request.params.offerId) throw ({ error: "Missing offer ID" })
        omanager.commitToOffer(request.params.offerId)
            .then((result) => {
                response.status(200).json({
                    committed: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function claimOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        if (!request.params.offerId) throw ({ error: "Missing offer ID" })
        omanager.claimOffer(request.params.offerId)
            .then((result) => {
                response.status(200).json({
                    claimed: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function confirmOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        if (!request.params.offerId) throw ({ error: "Missing offer ID" })
        omanager.confirmOffer(request.params.offerId)
            .then((result) => {
                response.status(200).json({
                    confirmed: result
                })
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getOffer(request, response) {
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        if (!request.params.offerId) throw ({ error: "Missing offer ID" })
        omanager.getOffer(request.params.offerId)
            .then((result) => {
                response.status(200).json(result);
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

function getOffers(request, response) { //todo improve
    try {
        let contractManager = erisC.newContractManagerDev(erisdbURL, utils.credentialFromHeaders(request.headers));
        let omanager = new offerManager.OfferManager(contractManager);
        omanager.getOffers(request.params.available==="true")
            .then((result) => {
                if (result[0]) {
                    response.status(200).json(result);
                } else {
                    response.status(200).json([]);
                }
            })
    } catch (error) {
        response.status(400).send(error);
    }
}

module.exports = {
    createOffer: createOffer,
    removeOffer: removeOffer,
    commitToOffer: commitToOffer,
    claimOffer: claimOffer,
    confirmOffer: confirmOffer,
    getOffer: getOffer,
    getOffers: getOffers
}