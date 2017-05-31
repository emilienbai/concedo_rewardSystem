import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Permissionner.sol";

/**
* Set user permission level.
*/
contract ActionSetUserPermission is Action {

      /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Address of the user we want to set permission
    * @param str {bytes32} - Unused
    * @param perm {uint} - Level of permission
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 str, uint perm, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address perms = dg.contracts("users");
        if(perms == 0x0){
            return false;
        }
        return Permissionner(perms).setPermission(addr,perm);
    }

}