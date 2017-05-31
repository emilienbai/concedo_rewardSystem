import "./ActionDb.sol";

/**
* Remove action. Does not allow 'addaction' to be removed, though that it can still
* be done by overwriting this action with one that allows it.
*/
contract ActionRemoveAction is Action {
    
    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - Unused
    * @param addr {address} - Unused
    * @param name {bytes32} - Name of the action to remove
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
        if(name == "addaction"){
          return false;
        }
        return ActionDb(adb).removeAction(name);
    }

}