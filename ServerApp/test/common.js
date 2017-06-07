var assert = require('assert');

var ActionManager = require('../JSManager/ActionManager');
var UserManager = require('../JSManager/UserManager');
var OfferManager = require('../JSManager/OfferManager');
var RewardManager = require('../JSManager/RewardManager');
var BankManager = require('../JSManager/BankManager');
var PermissionManager = require('../JSManager/PermissionManager');
var fs = require('fs');
var burrowC = require('@monax/legacy-contracts');
var utils = require('../JSManager/Utils');

var erisdbURL = "http://localhost:1337/rpc";

var contractData = require('../../jobs_output.json');

// properly instantiate the contract objects manager(userAddress) using the )erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('../../../../chains/concedo_chain/accounts.json');
var contractsManagerFull = burrowC.newContractManagerDev(erisdbURL, accountData.concedo_chain_full_000);
var contractsManagerVolunteer = burrowC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_000);
var contractsManagerElderly = burrowC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_001);
var contractsManagerRewarder = burrowC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_002);


var full = accountData.concedo_chain_full_000;
var partVolunteer = accountData.concedo_chain_participant_000;
var partElderly = accountData.concedo_chain_participant_001;
var partRewarder = accountData.concedo_chain_participant_002;

var perms = PermissionManager.perms;

//*******************Managers with Full Account*****************************************************
//Actions Manager
var actionManager = new ActionManager.ActionManager(contractsManagerFull);
//Users Manager
var userManagerFull = new UserManager.UserManager(contractsManagerFull);
//Permissions Manager
var permManagerFull = new PermissionManager.PermisssionManager(contractsManagerFull);
//OfferManager
var offerManagerFull = new OfferManager.OfferManager(contractsManagerFull);
//RewardManager
var rewardManagerFull = new RewardManager.RewardManager(contractsManagerFull);

//*********************Managers with Volunteer Account**********************************************
//OfferManager
var offerManagerVolunteer = new OfferManager.OfferManager(contractsManagerVolunteer);
//RewardManager
var rewardManagerVolunteer = new RewardManager.RewardManager(contractsManagerVolunteer);

//******************Managers with Elederly Account**************************************************
//OfferManager
var offerManagerElderly = new OfferManager.OfferManager(contractsManagerElderly);
//RewardManager
var rewardManagerElderly = new RewardManager.RewardManager(contractsManagerElderly);


//******************Managers with Rewarder Account**************************************************
//OfferManager
var offerManagerRewarder = new OfferManager.OfferManager(contractsManagerRewarder);
//RewardManager
var rewardManagerRewarder = new RewardManager.RewardManager(contractsManagerRewarder);


var permManagerVolunteer = new PermissionManager.PermisssionManager(contractsManagerVolunteer);

//********************************Users**********************************
var userFull = new UserManager.User("Full", "User", "Full Location", "birthdate", "0123456789", "full@users.com", "full");
var userVolunteer = new UserManager.User("Volunteer", "User", "Volunteer Location","birthdate", "2345678901", "volunteer@user.com", "volunteer");
var userElderly = new UserManager.User("Elederly", "User", "Elderly Location","birthdate", "4567890123", "elderly@users.com", "elderly");
var userRewarder = new UserManager.User("Rewarder", "User", "Rewarder Location","birthdate", "6789012345", "rewarder@users.com", "rewarder");

//************************************Offers********************************************************
let aaaOffer = new OfferManager.Offer("aaaOffer", "18/04/2017", 60, "Lulea", "gardening", "description...", {});
let bbbOffer = new OfferManager.Offer("bbbOffer", "18/05/2017", 80, "Luleb", "shopping", "description...", {});
let cccOffer = new OfferManager.Offer("cccOffer", "18/06/2017", 100, "Lulec", "driving", "description...", {});

//****************************************Rewards***************************************************
let aaaReward = new RewardManager.Reward("aaaReward", 50, 10, 20170324, "description du lolaaa...", "paaassword");
let bbbReward = new RewardManager.Reward("bbbReward", 50, 20, 20170324, "description du lolbbb...", "pbbbssword");
let cccReward = new RewardManager.Reward("cccReward", 50, 30, 20170324, "description du lolccc...", "pcccssword");



module.exports = {
    contractData: contractData,
    managers: {
        full: {
            actionManager: actionManager,
            userManager: userManagerFull,
            permManager: permManagerFull
        },
        volunteer: {
            offerManager: offerManagerVolunteer,
            rewardManager: rewardManagerVolunteer
        },
        elderly: {
            offerManager: offerManagerElderly,
            rewardManager: rewardManagerElderly
        },
        rewarder: {
            offerManager: offerManagerRewarder,
            rewardManager: rewardManagerRewarder
        }
    },
    users: {
        full: userFull,
        volunteer: userVolunteer,
        elderly: userElderly,
        rewarder: userRewarder
    },
    offers: {
        aaaOffer: aaaOffer,
        bbbOffer: bbbOffer,
        cccOffer: cccOffer
    },
    rewards : {
        aaaReward : aaaReward,
        bbbReward : bbbReward,
        cccReward : cccReward
    },
    address: {
        full: full,
        volunteer: partVolunteer,
        elderly: partElderly,
        rewarder: partRewarder
    },
    permLevels: perms
}