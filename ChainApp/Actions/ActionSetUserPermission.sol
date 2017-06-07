pragma solidity ^0.4.4;

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
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access user databse
        address perms = dg.contracts("users");
        if(perms == 0x0){
            return false;
        }

        //Set user permission
        return Permissionner(perms).setPermission(addr,perm);
    }

}