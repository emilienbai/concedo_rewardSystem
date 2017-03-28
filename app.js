// requires
var ActionManager = require('./JSManager/ActionManager');
var UserManager = require('./JSManager/UserManager');
var OfferManager = require('./JSManager/OfferManager');
var RewardManager = require('./JSManager/RewardManager');
var BankManager = require('./JSManager/BankManager');
var fs = require ('fs');
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
var contractsManagerPart = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_000);

// properly instantiate the contract objects using the abi and address

/***************************** Action Manager *********************************/
var actionManagerContract = contractsManagerFull.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


/*Log handling*/
//actionManagerContract.ShoutLog(startCallback, ActionManagerLogCallback);

function startCallback(error, eventSub){
    if(error){
        throw error;
    }
}

function ActionManagerLogCallback(error, event){
  if(error){
    console.error(error);
  }
  console.log("Log:: Caller: " + event.args.addr + 
    " Action: " + utils.hexToString(event.args.action))
}

var full = accountData.concedo_chain_full_000;
var part0 = accountData.concedo_chain_participant_000;
var part1 = accountData.concedo_chain_participant_001;


/*Actions*/
var actionManager = new ActionManager.ActionManager(contractsManagerFull);
//actionManager.addAllAction();

/*
var bankManager = new BankManager.BankManager(contractsManagerFull, ()=>{
    bankManager.getBalance(full.address, (result)=>{
        console.log("full Balance : " + result);
    });

    bankManager.getBalance(part0.address, (result)=>{
        console.log("Part0 Balance : " + result);
    });
});*/



/*Offer*/

var offerManagerFull = new OfferManager.OfferManager(contractsManagerFull);
//var offerManagerPart0 = new OfferManager.OfferManager(contractsManagerPart);

/*
let aaaOffer =  new OfferManager.Offer("aaaOffer", "18/04/2017", "20", "Lulea", "gardening", "description...", {});
let bbbOffer =  new OfferManager.Offer("bbbOffer", "18/05/2017", "40", "Luleb", "shopping", "description...", {});
let cccOffer =  new OfferManager.Offer("cccOffer", "18/06/2017", "60", "Lulec", "driving", "description...", {});



offerManagerFull.addOffer(aaaOffer, OfferManager.logOffer);
offerManagerFull.addOffer(bbbOffer, OfferManager.logOffer);
offerManagerFull.addOffer(cccOffer, OfferManager.logOffer);
*/

offerManagerFull.getOffers((resultList)=>{
    console.log(resultList);
});


/*offerManagerPart0.commitToOffer(aaaOffer.findId(), OfferManager.logOffer);
offerManagerPart0.claimOffer(aaaOffer.findId(), OfferManager.logOffer);
offerManagerFull.confirmOffer(aaaOffer.findId(), OfferManager.logOffer);*/

/*

var rewardManagerFull = new RewardManager.RewardManager(contractsManagerFull);
var rewardManagerPart = new RewardManager.RewardManager(contractsManagerPart);

let reward1 = new RewardManager.Reward("aaaReward", 10, 20170324, "description du lolaaa...", "paaassword");
let reward2 = new RewardManager.Reward("bbbReward", 20, 20170324, "description du lolaaa...", "pbbbssword");
let reward3 = new RewardManager.Reward("cccReward", 30, 20170324, "description du lolaaa...", "pcccssword");
*/
/*
rewardManagerFull.addReward(reward1.findID(), 50, reward1.toString(), RewardManager.logReward);
rewardManagerFull.addReward(reward2.findID(), 50, reward1.toString(), RewardManager.logReward);
rewardManagerFull.addReward(reward3.findID(), 50, reward1.toString(), RewardManager.logReward);
*/

//rewardManagerFull.removeReward(reward1.findID(), RewardManager.logReward);
//rewardManagerPart.buyReward(reward1.findID(), RewardManager.logReward);


