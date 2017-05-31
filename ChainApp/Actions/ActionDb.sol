import "./ActionManagerEnabled.sol";
import "./Action.sol";

contract ActionDb is ActionManagerEnabled {  

    /**
    * This is where we keep all the actions.
    */
    mapping (bytes32 => address) public actions;

    /**
    * To make sure we have an add action action, we need to auto generate
    * it as soon as we got the DOUG address.
    * @param dougAddr {address} - Address of DOUG contract
    * @return {bool} - signify if addition went well
    */
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

    /**
    * @notice Add an sction to the action database
    * @param name {bytes32} - Name of the action
    * @param addr {address} - Address of the action contract
    * @return {bool} - Signify if action have been added
    */
    function addAction(bytes32 name, address addr) returns (bool) {
        if(msg.sender != actions["addaction"]){
            return false;
        }

        bool sda = DougEnabled(addr).setDougAddress(DOUG);
        if(!sda){
            return false;
        }
        actions[name] = addr;
        return true;
    }

    /**
    * @notice Remove an action from the action database
    * @param name {bytes32} - Name of the action to remove
    * @return {bool} - Signify if deletion went well
    */
    function removeAction(bytes32 name) returns (bool) {
        if (actions[name] == 0x0){
            return false;
        }
        if(msg.sender != actions["removeaction"]){
            return false;
        }
        actions[name] = 0x0;
        return true;
    }

    /**
    * @notice Get permission required to execute an action
    * @param name {bytes32} - Name of the action
    * @return {uint} - level of permission required
    */
    function getPermission(bytes32 name) returns (uint){
        if (actions[name] == 0x0){
            return 0;
        }
        Action a = Action(actions[name]);
        return a.permission();
    }
}

/**
* Add action to the action databse. 
* NOTE: Overwrites currently added actions with the same name.
*/
contract ActionAddAction is Action {

    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - Unused
    * @param addr {address} - Address of the action contract to add
    * @param name {bytes32} - Name of the action
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address adb = dg.contracts("actiondb");
        if(adb == 0x0){
            return false;
        }
        return ActionDb(adb).addAction(name, addr);
    }
}