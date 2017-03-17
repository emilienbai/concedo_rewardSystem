var utils = require('./Utils');

var actionDbContract;
var actionManagerContract;
var contractData;

function getActionContractAddress(contractName, callback){
  actionDbContract.actions(contractName, 
    function(error, result){
      if(error)
        console.error(error);
      callback(result);
  });
}

function addAction(actionName, deployName, callback){
  let actionAdress =  contractData[deployName];
  let addr = utils.hexToString(actionAdress);
  let params = "execute(bytes32,bytes20) " + actionName + " " + addr;

  actionManagerContract.execute(  "addaction", 
                          params,
                          (error, result)=>{
                            if(error) console.error(error);
                            if(!result) callback(actionName, false)
                            else {
                              getActionContractAddress(actionName, (chainAddress) => {
                                  if(chainAddress != actionAdress)
                                    callback(actionName, false);
                                  else
                                    callback(actionName, true);
                              })
                            }
                          })
}

function logAddActionResult(actionName, res){
  console.log("AddAction : " + actionName + " -> " + res);
}



function addAllAction(_actionDbContract, _actionManagerContract, _contractData){
    actionDbContract = _actionDbContract;
    actionManagerContract = _actionManagerContract;
    contractData = _contractData;
/*
    addAction("addcontract", "deployActionAddContract", logAddActionResult);
    addAction("removecontract", "deployActionRemoveContract", logAddActionResult);
    addAction("charge", "deployActionCharge", logAddActionResult);
    addAction("endow", "deployActionEndow", logAddActionResult);
    addAction("lockactions", "deployActionLockActions", logAddActionResult);
    addAction("unlockactions", "deployActionUnlockActions", logAddActionResult);
    addAction("setactionperm", "deployActionSetActionPermission", logAddActionResult);
    addAction("setuserperm", "deployActionSetUserPermission", logAddActionResult);
    */
    addAction("adduser", "deployActionAddUser", logAddActionResult);
    addAction("removeuser", "deployActionRemoveUser", logAddActionResult);
}

module.exports = {
    addAll: addAllAction
}