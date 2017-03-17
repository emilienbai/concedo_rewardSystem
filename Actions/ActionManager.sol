import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";
import "../Permissions.sol";
import "./ActionDb.sol";

contract ActionManager is DougEnabled {

  struct ActionLogEntry {
    address caller;
    bytes32 action;
    uint blockNumber;
    bool success;
  }

  struct ArgStruct {
    bytes byteArray;
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

  function useless() returns(address){
    return ContractProvider(DOUG).contracts("actiondb");
  }

  function execute(bytes32 actionName, bytes data) returns (bool) {
    mapping(uint => ArgStruct) argStructs;


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
      Permissions p = Permissions(pAddr);

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
    // TODO keep up with return values from generic calls.
    // Just assume it succeeds for now (important for logger).

    uint sliceCount = 0;
   
    argStructs[0].byteArray.length = 0;
    for (uint i=0;i < data.length; i++){
      if (data[i] != ' '){
        argStructs[sliceCount].byteArray.push(data[i]);
      } else {
        sliceCount ++;
        argStructs[sliceCount].byteArray.length = 0;
      }
    }
    bool result = true;
    if (sliceCount == 0)
      result = actn.call(bytes4(sha3(argStructs[0].byteArray)));
    else if (sliceCount == 1)
      result = actn.call(bytes4(sha3(argStructs[0].byteArray)), argStructs[1].byteArray);
    else
      result = actn.call(bytes4(sha3(argStructs[0].byteArray)), argStructs[1].byteArray, argStructs[2].byteArray);
      //todo add slices

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