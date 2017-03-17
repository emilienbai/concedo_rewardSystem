import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionDb.sol";

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
  address activeAction;

  uint8 permToLock = 255; // Current max.
  bool locked;

  // Adding a logger here, and not in a separate contract. This is wrong.
  // Will replace with array once that's confirmed to work with structs etc.
  uint public nextEntry = 0;
  mapping(uint => ActionLogEntry) public logEntries;

  function ActionManager(){
    permToLock = 255;    
  }

  function execute(bytes32 actionName, bytes data0, bytes data1, bytes data2, bytes data3, bytes data4) returns (bool) {

    address actionDb = ContractProvider(DOUG).contracts("actiondb");
    if (actionDb == 0x0){
      _log(actionName,false);
      return false;
    }
    address actn = ActionDb(actionDb).actions(actionName);
    // If no action with the given name exists - cancel.
    if (actn == 0x0){
      _log(actionName,false);
      return false;
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
        return false;
      }

      // Now we check the permission that is required to execute the action.
      uint8 permReq = Action(actn).permission();

      // Very simple system.
      if (perm < permReq){
        _log(actionName,false);
        return false;
      }
    }

    // Set this as the currently active action.
    activeAction = actn;

   bool result = true; 
    
    if(data4.length != 0){
        result = actn.call(bytes4(sha3(data0)), msg.sender, data1, data2, data3, data4);
    } else if(data3.length != 0){
        result = actn.call(bytes4(sha3(data0)), msg.sender, data1, data2, data3);
    } else if(data2.length != 0){
        result = actn.call(bytes4(sha3(data0)), msg.sender, data1, data2);
    } else if(data1.length != 0){
        result = actn.call(bytes4(sha3(data0)), msg.sender, data1);
    } else if(data0.length != 0){
        result = actn.call(bytes4(sha3(data0)), msg.sender);
    }

    activeAction = 0x0;
    _log(actionName,result);
    return result;
  }

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

  // Validate can be called by a contract like the bank to check if the
  // contract calling it has permissions to do so.
  function validate(address addr) constant returns (bool) {
    return addr == activeAction;
  }

  function _log(bytes32 actionName, bool success) internal {
    // TODO check if this is really necessary in an internal function.
    /*if(msg.sender != address(this)){
      return;
    }*/
    ActionLogEntry le = logEntries[nextEntry++];
    le.caller = msg.sender;
    le.action = actionName;
    le.success = success;
    le.blockNumber = block.number;
    ShoutLog(le.caller, le.action, success);
  }

}