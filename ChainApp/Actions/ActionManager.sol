pragma solidity ^0.4.4;

import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionDb.sol";
import "./ActiveAction.sol";


contract ActionManager is DougEnabled {

  uint permToLock = 40; // Current max.
  bool locked;

  function ActionManager(){
    permToLock = 40;    
  }

  /**
  * @notice Handle execution of all actions
  * @param actionName {bytes32} - Name of the action to execute
  * @param addr {address} - Param typed address
  * @param str {bytes32} - Param of type bytes32
  * @param intVal {uint} - Param of type unsigned int
  * @param data {bytes} - Param of type bytes
  * @return result {bool} - Result of the execution
  */
  function execute(bytes32 actionName, address addr, bytes32 str, uint intVal, bytes data) returns (bool result) {
    //execution is considered failed except specified otherwise
    result = false;
    //Get the action DB address
    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    if (actionDb == 0x0){
      return;
    }
    
    // Get the action to execute address
    address actn = ActionDb(actionDb).actions(actionName);
    if (actn == 0x0){
      return;
    }
   
    //Get the address of user database
    address pAddr = ContractProvider(DOUG).contracts("users");
    if(pAddr != 0x0){
      Permissionner p = Permissionner(pAddr);

      //Retrieve user level of permission
      uint perm = p.perms(msg.sender);

      // Now we check that the action manager isn't locked down. In that case, special
      // permissions is needed.
      if(locked && perm < permToLock){
        result = false;
        return;
      }

      // Now we check the permission that is required to execute the action.
      uint permReq = Action(actn).permission();

      // Either authorized user or Admin
      if (perm != permReq && perm <= permToLock && permReq != 0){
        result = false;
        return;
      }
    }
    
    // Set this as the currently active action, then execute
    setActive(actn);
    result = Action(actn).execute(msg.sender, addr, str, intVal, data);
    setActive(0x0);
    return;
  }

  /**
  * @notice Get the address of the currently active action
  * @return {address} - Address of the current active action
  */
  function getActive() internal constant returns (address){
    address activeActionContract = ContractProvider(DOUG).contracts("activeaction");
    if(activeActionContract == 0x0) return 0x0;
    ActiveAction aa = ActiveAction(activeActionContract);
    return aa.get();
  }

  /**
  * @notice Set the address of the currently active action
  * @param newActive {address} - Address of the newly active action
  * @return {address} - Address that is stored
  */
  function setActive(address newActive) internal returns (address){
    address activeActionContract = ContractProvider(DOUG).contracts("activeaction");
    if(activeActionContract == 0x0) return 0x0;
    ActiveAction aa = ActiveAction(activeActionContract);
    return aa.set(newActive);
  }

  /**
  * @notice Lock the action manager to prevent some action execution
  * @return {bool} - True if the action manager have been locked
  */
  function lock() returns (bool) {
    address activeAction = getActive();
    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    if (actionDb == 0x0){
      return false;
    }
    address lockAction = ActionDb(actionDb).actions("lock");
    if(activeAction != lockAction){
      return false;
    }
    if(locked){
      return false;
    }
    locked = true;
    return true;
  }

  /**
  * @notice  Unlock the action Manager
  * @return {bool} - True if the action Manager have been unlockced
  */
  function unlock() returns (bool) {
    address activeAction = getActive();
    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    if (actionDb == 0x0){
      return false;
    }
    address unLockAction = ActionDb(actionDb).actions("unlock");
    if(activeAction != unLockAction){
      return false;
    }
    if(!locked){
      return false;
    }
    locked = false;
    return true;
  }
}