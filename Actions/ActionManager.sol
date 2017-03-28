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


  event ShoutLog(address indexed addr, bytes32 indexed action, bool indexed success);

  bool LOGGING = true;

  // This is where we keep the "active action".
  // TODO need to keep track of uses of (STOP) as that may cause activeAction
  // to remain set and opens up for abuse. (STOP) is used as a temporary array
  // out-of bounds exception for example (or is planned to), which means be
  // careful. Does it revert the tx entirely now, or does it come with some sort
  // of recovery mechanism? Otherwise it is still super dangerous and should never
  // ever be used. Ever.
  //address public activeAction;

  uint8 permToLock = 255; // Current max.
  bool locked;

  // Adding a logger here, and not in a separate contract. This is wrong.
  // Will replace with array once that's confirmed to work with structs etc.
  uint public nextEntry = 0;
  mapping(uint => ActionLogEntry) public logEntries;

  function ActionManager(){
    permToLock = 255;    
  }

  function execute(bytes32 actionName, address addr, bytes32 str, uint intVal, bytes data) returns (bool result, address retAddr) {
    result = false;
    retAddr = this; //This return address is kept because if there is an exception here, it will be null
    ShoutLog(retAddr, "  actionManager", false);
    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    ShoutLog(actionDb, "  actionDb", false);
    if (actionDb == 0x0){
      _log(actionName,false);
      result = false;
      return;
    }
    
    address actn = ActionDb(actionDb).actions(actionName);
    ShoutLog(actn, "  actionAddress", false);
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
      uint8 perm = p.perms(msg.sender);

      // Now we check that the action manager isn't locked down. In that case, special
      // permissions is needed.
      if(locked && perm < permToLock){
        _log(actionName,false);
        result = false;
        return;
      }

      // Now we check the permission that is required to execute the action.
      uint8 permReq = Action(actn).permission();

      // Very simple system.
      if (perm < permReq){
        _log(actionName,false);
        result = false;
        return;
      }
    }
    
    // Set this as the currently active action.
    setActive(actn);

    Action toEx = Action(actn);

    result = toEx.execute(msg.sender, addr, str, intVal, data);
    if(result) ShoutLog(retAddr, "  ThisIsTrue", true);
    else ShoutLog(retAddr, "  ThisIsFalse", false);

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
/*
  function lock() returns (bool) {
    if(msg.sender != activeAction){
      return false;
    }
    if(locked){
      return false;
    }
    locked = true;
  }

  function unlock() returns (bool) {
    if(msg.sender != activeAction){
      return false;
    }
    if(!locked){
      return false;
    }
    locked = false;
  }
*/
  function _log(bytes32 actionName, bool success) internal {
    ActionLogEntry le = logEntries[nextEntry++];
    le.caller = msg.sender;
    le.action = actionName;
    le.success = success;
    le.blockNumber = block.number;
    ShoutLog(le.caller, le.action, success);
  }

}