import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionDb.sol";
import "./ActiveAction.sol";


contract ActionManager is DougEnabled {

  struct ActionLogEntry {
    address caller;
    bytes32 action;
    uint blockNumber;
    bool success;
  }


  event ShoutLog(address indexed addr, bytes32 indexed action, uint indexed intVal);

  bool LOGGING = true;

  // This is where we keep the "active action".
  // TODO need to keep track of uses of (STOP) as that may cause activeAction
  // to remain set and opens up for abuse. (STOP) is used as a temporary array
  // out-of bounds exception for example (or is planned to), which means be
  // careful. Does it revert the tx entirely now, or does it come with some sort
  // of recovery mechanism? Otherwise it is still super dangerous and should never
  // ever be used. Ever.
  //address public activeAction;

  uint permToLock = 40; // Current max.
  bool locked;

  // Adding a logger here, and not in a separate contract. This is wrong.
  // Will replace with array once that's confirmed to work with structs etc.
  uint public nextEntry = 0;
  mapping(uint => ActionLogEntry) public logEntries;

  function ActionManager(){
    permToLock = 255;    
  }

  function execute(bytes32 actionName, address addr, bytes32 str, uint intVal, bytes data) returns (bool result) {
    result = false;
    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    if (actionDb == 0x0){
      _log(actionName,false);
      result = false;
      return;
    }
    
    address actn = ActionDb(actionDb).actions(actionName);
    // If no action with the given name exists - cancel.
    if (actn == 0x0){
      _log(actionName,false);
      result = false;
      return;
    }

    
    
      // Permissions stuff
    address pAddr = ContractProvider(DOUG).contracts("perms");
    // Only check permissions if there is a permissions contract.
    if(pAddr != 0x0){
      Permissionner p = Permissionner(pAddr);

      // First we check the permissions of the account that's trying to execute the action.
      uint perm = p.perms(msg.sender);

      // Now we check that the action manager isn't locked down. In that case, special
      // permissions is needed.
      if(locked && perm < permToLock){
        _log(actionName,false);
        result = false;
        return;
      }

      // Now we check the permission that is required to execute the action.
      uint permReq = Action(actn).permission();

      // Either authorized user or Admin
      if (perm != permReq && perm < permToLock && permReq != 0){
        _log(actionName,false);
        result = false;
        return;
      }
    }
    
    // Set this as the currently active action.
    setActive(actn);
    result = Action(actn).execute(msg.sender, addr, str, intVal, data);

    setActive(0x0);
    _log(actionName,result);

    return;
  }

  function getActive() returns (address){
    address activeActionContract = ContractProvider(DOUG).contracts("activeaction");
    if(activeActionContract == 0x0) return 0x0;
    ActiveAction aa = ActiveAction(activeActionContract);
    return aa.get();
  }

  function setActive(address newActive) returns (address){
    address activeActionContract = ContractProvider(DOUG).contracts("activeaction");
    if(activeActionContract == 0x0) return 0x0;
    ActiveAction aa = ActiveAction(activeActionContract);
    return aa.set(newActive);
  }

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
  }

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
  }

  function _log(bytes32 actionName, bool success) internal {
    ActionLogEntry le = logEntries[nextEntry++];
    le.caller = msg.sender;
    le.action = actionName;
    le.success = success;
    le.blockNumber = block.number;
    ShoutLog(le.caller, le.action, 0);
  }

}