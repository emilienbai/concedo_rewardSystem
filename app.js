// requires
var ActionManager = require('./JSManager/ActionManager');
var UserManager = require('./JSManager/UserManager');
var OfferManager = require('./JSManager/OfferManager');
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

// properly instantiate the contract objects manager using the )erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('../../chains/concedo_chain/accounts.json');
var contractsManagerFull = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_full_000);
var contractManagerPart = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_participant_000);

// properly instantiate the contract objects using the abi and address

/***************************** Action Manager *********************************/
var actionManagerContract = contractsManagerFull.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


/*Log handling*/
actionManagerContract.ShoutLog(startCallback, ActionManagerLogCallback);

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


/**************************** ActionDb contract *******************************/
var actionDbContractAdress = contractData["deployActionDb"];
var actionDbAbi = JSON.parse(fs.readFileSync("./abi/" + actionDbContractAdress));

var actionDbContract = contractsManagerFull.newContractFactory(actionDbAbi).at(actionDbContractAdress);

//actionDbContract.ShoutLog(startCallback, logActionDbCallback);

/*Log handling*/
function logActionDbCallback(error, event){
    console.log("ActionDbLog:: Message: " + utils.hexToString(event.args.message) + 
      " Address: " + event.args.addr);
}

/******************************ActionAddUser***********************************/
/*var AddUserActionContractAddress = contractData["deployActionAddUser"];
var AddUserActionAbi = JSON.parse(fs.readFileSync("./abi/" + AddUserActionContractAddress));
var AddUserActionContract = contractsManagerFull.newContractFactory(AddUserActionAbi).at(AddUserActionContractAddress);*/

//AddUserActionContract.ShoutLog(startCallback, logAddUserActionCallback);

/*Log handling*/
function logAddUserActionCallback(error, event){
    console.log("AddUserActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.message));
}

/****************************ActionRemoveUser**********************************/
/*var RemoveUserActionContractAddress = contractData["deployActionRemoveUser"];
var RemoveUserActionAbi = JSON.parse(fs.readFileSync("./abi/" + RemoveUserActionContractAddress));
var RemoveUserActionContract = contractsManagerFull.newContractFactory(RemoveUserActionAbi).at(RemoveUserActionContractAddress);*/

//RemoveUserActionContract.ShoutLog(startCallback, logRemoveUserActionCallback);
/*Log handling*/
function logRemoveUserActionCallback(error, event){
    console.log("RemoveUserActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.message));
}

/***********************************UserDb************************************/
/*var UserDbContractAddress = contractData["deployUsers"];
var UserDbAbi = JSON.parse(fs.readFileSync("./abi/" + UserDbContractAddress));
var UserDbContract = contractsManagerFull.newContractFactory(UserDbAbi).at(UserDbContractAddress);*/

//UserDbContract.ShoutLog(startCallback, logUserDbCallback);

/*Log handling*/
function logUserDbCallback(error, event){
    console.log("UserDbLog:: Message: " + utils.hexToString(event.args.message));
}

/********************************User*****************************************/
//var UserContractAddress = contractData["deployUser"];
//var UserAbi = JSON.parse(fs.readFileSync("./abi/" + UserContractAddress));
//var UserContract = contractsManagerFull.newContractFactory(UserAbi).at(UserContractAddress);

/********************************OfferDB**************************************/
var OfferDbcontractAddress = contractData["deployOffers"];
var offerDbAbi = JSON.parse(fs.readFileSync("./abi/" + OfferDbcontractAddress));
var OfferDbContract = contractsManagerFull.newContractFactory(offerDbAbi).at(OfferDbcontractAddress);

//OfferDbContract.ShoutLog(startCallback, logOfferDbCallback);

/*Log handling*/
function logOfferDbCallback(error, event){
    console.log("offerDBLog:: Addr: " + event.args.addr + " Message: " + utils.hexToString(event.args.msg) );
}


/****************************ActionAddOffer**********************************/
var AddOfferActionContractAddress = contractData["deployActionAddOffer"];
var AddOfferActionAbi = JSON.parse(fs.readFileSync("./abi/" + AddOfferActionContractAddress));
var AddOfferActionContract = contractsManagerFull.newContractFactory(AddOfferActionAbi).at(AddOfferActionContractAddress);

//AddOfferActionContract.ShoutLog(startCallback, logAddOfferActionCallback);

/*Log handling*/
function logAddOfferActionCallback(error, event){
    console.log("AddOfferActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.message));
}

/***************************ActionCommitToOffer****************************/
var CommitToOfferActionContractAddress = contractData["deployActionCommitToOffer"];
var CommitToOfferActionAbi = JSON.parse(fs.readFileSync("./abi/" + CommitToOfferActionContractAddress));
var CommitToOfferActionContract = contractsManagerFull.newContractFactory(CommitToOfferActionAbi).at(CommitToOfferActionContractAddress);

//CommitToOfferActionContract.ShoutLog(startCallback, logCommitToOfferActionCallback);

/*Log handling*/
function logCommitToOfferActionCallback(error, event){
    console.log("CommitToOfferActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.msg));
}


function getUserAddress(address, callback){
    UserDbContract.users(address, function(error, result){
        if(error)
            console.log(error);
        console.log(result);
        callback(result);
    })
}

var full = accountData.concedo_chain_full_000;
var part0 = accountData.concedo_chain_participant_000;
var part1 = accountData.concedo_chain_participant_001;


/*Actions*/


var actionManager = new ActionManager.ActionManager(contractsManagerFull);
actionManager.addAllAction();
actionManager.removeAction("adduser", ActionManager.logResult);


/* User */
/*var userManager = new UserManager.UserManager(contractsManagerFull);
let user1 = new UserManager.User("Name", "Surname", "Address", "Phone", "Email");

userManager.addUser(full.address, "ful l01", user1.encrypt(), UserManager.logAddUser);
userManager.getUserAddress(full.address, UserManager.logGetUserAddress);
userManager.removeUser(full.address, UserManager.logRemoveUser);
userManager.getUserAddress(full.address, UserManager.logGetUserAddress);
*/


/*
var offerManagerFull = new OfferManager.OfferManager(contractsManagerFull);
//var offerManagerPart0 = new OfferManager.OfferManager(erisdbURL, part0);
let aaaOffer =  new OfferManager.Offer("aaaOffer", "18/04/2017", "50", "gardening", "description...", {});

offerManagerFull.addOffer(aaaOffer.findId(), 125, aaaOffer.toString(), OfferManager.logOffer);
offerManagerFull.commitToOffer(aaaOffer.findId(), OfferManager.logOffer); // -> Should return false
//offerManagerPart0.commitToOffer(aaaOffer.findId(), OfferManager.logOffer); // -> Should return true
*/

/*
var offerManagerFull = new OfferManager.OfferManager(contractsManagerFull);
var offerManagerPart00 = new OfferManager.OfferManager(contractManagerPart);
let aaaOffer =  new OfferManager.Offer("aaaOffer", "18/04/2017", "50", "gardening", "description...", {});

//offerManagerFull.commitToOffer(aaaOffer.findId(), OfferManager.logOffer); // -> Should return false
*/