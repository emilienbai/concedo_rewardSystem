// requires
var ActionManager = require('./JSManager/ActionManager');
var UserManager = require('./JSManager/UserManager');
var OfferManager = require('./JSManager/OfferManager');
var RewardManager = require('./JSManager/RewardManager');
var BankManager = require('./JSManager/BankManager');
var PermissionManager = require('./JSManager/PermissionManager');
var fs = require('fs');
var erisC = require('eris-contracts');
var utils = require('./JSManager/Utils');


// NOTE. On Windows/OSX do not use localhost. find the
// url of your chain with:
// docker-machine ls
// and find the docker machine name you are using (usually default or eris).
// for example, if the URL returned by docker-machine is tcp://192.168.99.100:2376
// then your erisdbURL should be http://192.168.99.100:1337/rpc
var erisdbURL = "http://localhost:1337/rpc";

// get the abi and deployed data squared away
var contractData = require('./jobs_output.json');
var actionManagerContractAddress = contractData["deployActionManager"];
var actionManagerAbi = JSON.parse(fs.readFileSync("./abi/" + actionManagerContractAddress));

// properly instantiate the contract objects manager(userAddress) using the )erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('../../chains/concedo_chain/accounts.json');
var contractsManagerFull = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_full_000);
var contractsManagerVolunteer = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_000);
var contractsManagerElderly = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_001);
var contractsManagerRewarder = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_002);

// properly instantiate the contract objects using the abi and address

/***************************** Action Manager *********************************/
var actionManagerContract = contractsManagerFull.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


/*Log handling*/
//actionManagerContract.ShoutLog(startCallback, ActionManagerLogCallback);
var addressSetSub;
function startCallback(error, eventSub) {
    if (error) {
        throw error;
    }
    addressSetSub = eventSub;
}

function ActionManagerLogCallback(error, event) {
    if (error) {
        console.error(error);
    }
    console.log("Log:: Caller: " + event.args.addr +
        " Action: " + utils.hexToString(event.args.action) + " " + event.args.intVal);
}



var full = accountData.concedo_chain_full_000;
var partVolunteer = accountData.concedo_chain_participant_000;
var partElderly = accountData.concedo_chain_participant_001;
var partRewarder = accountData.concedo_chain_participant_002;


//Actions
var actionManager = new ActionManager.ActionManager(contractsManagerFull);

var permManagerFull = new PermissionManager.PermisssionManager(contractsManagerFull);
var permManagerVolunteer = new PermissionManager.PermisssionManager(contractsManagerVolunteer);

var perms = PermissionManager.perms;

function AddActionAndSetPermission() {
    actionManager.addAllAction()
        .then(() => {
            return permManagerFull.setUserPermission(full.address, perms.FULL);
        })
        .then((result) => {
            console.log("Set full perm -> " + true);
            return permManagerFull.setAllActionPerm();
        })
        .then(() => {
            return permManagerFull.setUserPermission(partVolunteer.address, perms.VOLUNTEER);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.VOLUNTEER + " : " + partVolunteer.address + " -> " + result);
            return permManagerFull.setUserPermission(partElderly.address, perms.ELDERLY);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.ELDERLY + " : " + partElderly.address + " -> " + result);
            return permManagerFull.setUserPermission(partRewarder.address, perms.REWARDER);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.REWARDER + " : " + partRewarder.address + " -> " + result);
            console.log("Actions deployed and permissions set !");
        }).catch(console.error);
}

//AddActionAndSetPermission();

/*
var bankManager = new BankManager.BankManager(contractsManagerFull, ()=>{
    bankManager.getBalance(partRewarder.address, (result)=>{
        console.log("Rewarder Balance : " + result);
    });

    bankManager.getBalance(partVolunteer.address, (result)=>{
        console.log("Volunteer Balance : " + result);
    });
});
*/


//***************************************Offer*********************************/

var offerManagerFull = new OfferManager.OfferManager(contractsManagerFull);
var offerManagerElderly = new OfferManager.OfferManager(contractsManagerElderly);
var offerManagerVolunteer = new OfferManager.OfferManager(contractsManagerVolunteer);
var offerManagerRewarder = new OfferManager.OfferManager(contractsManagerRewarder);

let aaaOffer = new OfferManager.Offer("aaaOffer", "18/04/2017", 60, "Lulea", "gardening", "description...", {});
let bbbOffer = new OfferManager.Offer("bbbOffer", "18/05/2017", 80, "Luleb", "shopping", "description...", {});
let cccOffer = new OfferManager.Offer("cccOffer", "18/06/2017", 100, "Lulec", "driving", "description...", {});

function testOffers() {
    offerManagerElderly.addOffer(aaaOffer)
    .then((result)=>{ //Expected true
        console.log("Elderly adds aaaOffer : " + result);
        return offerManagerVolunteer.addOffer(bbbOffer);
    })
    .then((result) => { //Expected false
        console.log("Volunteer adds bbbOffer : " + result);
        return offerManagerRewarder.addOffer(cccOffer);
    })
    .then((result)=>{ //Expected false
        console.log("Rewarder adds cccOffer : " + result);
        return offerManagerVolunteer.commitToOffer(aaaOffer.findId());
    })
    .then((result)=>{ //Expected true
        console.log("Volunteer commits : " + result);
        return offerManagerVolunteer.claimOffer(aaaOffer.findId());
    })
    .then((result)=>{ //Expected true
        console.log("Volunteer claims : " + result);
        return offerManagerElderly.confirmOffer(aaaOffer.findId());
    })
    .then((result)=> { //Expected true
        console.log("Elderly confirms : " + result);
    })
    .catch(console.error);
}

//testOffers();

/*
offerManagerFull.getOffers()
.then((result)=>{
    console.log(result);
}).catch(console.error);
*/

//***************************Rewards*******************************************/





var rewardManagerFull = new RewardManager.RewardManager(contractsManagerFull);
var rewardManagerVolunteer = new RewardManager.RewardManager(contractsManagerVolunteer);
var rewardManagerElderly = new RewardManager.RewardManager(contractsManagerElderly);
var rewardManagerRewarder = new RewardManager.RewardManager(contractsManagerRewarder);

let aaareward = new RewardManager.Reward("aaaReward", 50, 10, 20170324, "description du lolaaa...", "paaassword");
let bbbreward = new RewardManager.Reward("bbbReward", 50, 20, 20170324, "description du lolbbb...", "pbbbssword");
let cccreward = new RewardManager.Reward("cccReward", 50, 30, 20170324, "description du lolccc...", "pcccssword");


function testRewards(){
    rewardManagerRewarder.addReward(aaareward)
    .then((result)=>{ //Expected true
        console.log("Rewarder adds aaaReward ->" + result);
        return rewardManagerVolunteer.addReward(bbbreward);
    })
    .then((result)=>{//Expected false
        console.log("Volunteer adds bbbReward -> " + result);
        return rewardManagerElderly.addReward(cccreward);
    })
    .then((result)=>{//Expected false
        console.log("Elderly adds cccReward -> " + result);
        return rewardManagerVolunteer.buyReward(aaareward.findId());
    }).then((result)=>{//Depends on User balance
        console.log("Volunteer buys aaaReward -> " + result);
    })
    .catch(console.error);
}

//testRewards();

/*
rewardManagerFull.getRewards()
.then((result)=>{
    console.log(result);
}).catch(console.error);
*/