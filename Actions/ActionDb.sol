import "./ActionManagerEnabled.sol";
import "./Action.sol";

contract ActionDb is ActionManagerEnabled {

    event ShoutLog(address indexed addr, bytes32 indexed message, bool indexed success);
    

    // This is where we keep all the actions.
    mapping (bytes32 => address) public actions;

    // To make sure we have an add action action, we need to auto generate
    // it as soon as we got the DOUG address.
    function setDougAddress(address dougAddr) returns (bool result) {
      bool res = super.setDougAddress(dougAddr);
      if(!res){
          return false;
      }

      var addaction = new ActionAddAction();
      // If this fails, then something is wrong with the add action contract.
      // Will be events logging these things in later parts.
      if(!DougEnabled(addaction).setDougAddress(dougAddr)){
          return false;
      }
      actions["addaction"] = address(addaction);
      return true;
    }

    function addAction(bytes32 name, address addr) returns (bool) {
        if(msg.sender != actions["addaction"]){
            ShoutLog(this, name, false);
            return false;
        }
        // Remember we need to set the doug address for the action to be safe -
        // or someone could use a false doug to do damage to the system.
        // Normally the Doug contract does this, but actions are never added
        // to Doug - they're instead added to this lower-level CMC.
        bool sda = DougEnabled(addr).setDougAddress(DOUG);
        if(!sda){
            ShoutLog(this, name, false);
            return false;
        }
        actions[name] = addr;
        ShoutLog(addr, name, false);
        return true;
    }

    function removeAction(bytes32 name) returns (bool) {
        if (actions[name] == 0x0){
            return false;
        }
        if(msg.sender != actions["removeaction"]){
            ShoutLog(this, name, false);
            return false;
        }
        actions[name] = 0x0;
        return true;
    }

    function log(address addr, bytes32 text, bool sucess){
        ShoutLog(addr, text, sucess);
    }

}

// Add action. NOTE: Overwrites currently added actions with the same name.
contract ActionAddAction is Action {

    event ShoutLog(address indexed addr, bytes32 indexed message);

    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        ShoutLog(this, "  Hello World");

        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address adb = dg.contracts("actiondb");
        if(adb == 0x0){
            ShoutLog(DOUG, " No ActionDB");
            return false;
        }

        return ActionDb(adb).addAction(name, addr);
    }
}