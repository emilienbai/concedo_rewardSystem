import "./Action.sol";
import "./ActionDb.sol";
import "../Interfaces/ContractProvider.sol"; 

// The set action permission. This is the permission level required to run the action.
contract ActionSetActionPermission is Action {

    function execute(address sender, address addr, bytes32 name, uint perm, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address adb = dg.contracts("actiondb");
        if(adb == 0x0){
            return false;
        }
        var action = ActionDb(adb).actions(name);
        if(action == 0x0){
            return false;
        }
        return Action(action).setPermission(perm);
    }

}