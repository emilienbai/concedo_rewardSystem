// requires
var addAction = require('./addAction');
var fs = require ('fs');
var erisC = require('eris-contracts');
var utils = require('./Utils');


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

// properly instantiate the contract objects manager using the erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('../../chains/concedo_chain/accounts.json');
var contractsManager = erisC.newContractManagerDev(erisdbURL, accountData.concedo_chain_full_000);

// properly instantiate the contract objects using the abi and address

/***************************** Action Manager *********************************/
var actionManagerContract = contractsManager.newContractFactory(actionManagerAbi).at(actionManagerContractAddress);


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

var actionDbContract = contractsManager.newContractFactory(actionDbAbi).at(actionDbContractAdress);

actionDbContract.ShoutLog(startCallback, logActionDbCallback);

/*Log handling*/
function logActionDbCallback(error, event){
    console.log("ActionDbLog:: Message: " + utils.hexToString(event.args.message) + 
      " Address: " + event.args.addr);
}

/******************************ActionAddUser***********************************/
var AddUserActionContractAddress = contractData["deployActionAddUser"];
var AddUserActionAbi = JSON.parse(fs.readFileSync("./abi/" + AddUserActionContractAddress));
var AddUserActionContract = contractsManager.newContractFactory(AddUserActionAbi).at(AddUserActionContractAddress);

AddUserActionContract.ShoutLog(startCallback, logAddUserActionCallback);

/*Log handling*/
function logAddUserActionCallback(error, event){
    console.log("AddUserActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.message));
}

/****************************ActionRemoveUser**********************************/
var RemoveUserActionContractAddress = contractData["deployActionRemoveUser"];
var RemoveUserActionAbi = JSON.parse(fs.readFileSync("./abi/" + RemoveUserActionContractAddress));
var RemoveUserActionContract = contractsManager.newContractFactory(RemoveUserActionAbi).at(RemoveUserActionContractAddress);

RemoveUserActionContract.ShoutLog(startCallback, logRemoveUserActionCallback);
/*Log handling*/
function logRemoveUserActionCallback(error, event){
    console.log("RemoveUserActionLog:: Addr:" + event.args.addr + " Message: " + utils.hexToString(event.args.message));
}

/*************************** Add Actions **************************************/



function getActionContractAddress(contractName, callback){
  actionDbContract.actions(contractName, 
    function(error, result){
      if(error)
        console.error(error);
      callback(result);
  });
}



function addUser(address, pseudo, perm, data){
    let stringAddr = utils.hexToString(address);

    let params = "execute(address,bytes20,bytes32,uint8)";// + stringAddr + " " + pseudo + " " + perm;

    actionManagerContract.execute( "adduser", 
                          params, stringAddr, pseudo, perm, data,
                          (error, result)=>{
                            if(error) console.error(error);
                            console.log(result);
                          })
}

function removeUser(address){
    let stringAddress = utils.hexToString(address);

    let params = "execute(address,bytes20)";

    actionManagerContract.execute( "removeuser", 
                                    params, stringAddress, 
                                    (error, result)=>{
                                        if(error) console.error(error);
                                        console.log(result);
                                    })
}

function test(){
    AddUserActionContract.test(()=>{

    })
}



var UserDbContractAddress = contractData["deployUsers"];
//console.log(UserDbContractAddress);
var UserDbAbi = JSON.parse(fs.readFileSync("./abi/" + UserDbContractAddress));
var UserDbContract = contractsManager.newContractFactory(UserDbAbi).at(UserDbContractAddress);

UserDbContract.ShoutLog(startCallback, logUserDbCallback);

/*Log handling*/
function logUserDbCallback(error, event){
    console.log("UserDbLog:: Message: " + utils.hexToString(event.args.message));
}

function test2(){
    UserDbContract.test(()=>{

    })
}

function getUserAddress(address){
    UserDbContract.users(address, function(error, result){
        if(error)
            console.log(error);
        console.log(result);
    })
}

//addAction.addAll(actionDbContract, actionManagerContract, contractData);

//addUser(accountData.concedo_chain_full_000.address, "mimilleFull", 25);
//addUser(accountData.concedo_chain_participant_000.address, "mimillePart", 15);

getUserAddress(accountData.concedo_chain_full_000.address);
//getUserAddress(accountData.concedo_chain_participant_000.address);

//removeUser(accountData.concedo_chain_full_000.address);

/*
getActionContractAddress("adduser", function(res){
    console.log(res);
});*/


//addUser();
//test();
//test2();

