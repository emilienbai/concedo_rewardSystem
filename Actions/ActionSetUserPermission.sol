import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Permissionner.sol";

// The set user permission action.
contract ActionSetUserPermission is Action {

    function execute(address addr, uint8 perm) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address perms = dg.contracts("perms");
        if(perms == 0x0){
            return false;
        }
        return Permissionner(perms).setPermission(addr,perm);
    }

}