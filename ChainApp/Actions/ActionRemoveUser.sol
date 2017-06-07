pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/Users.sol";
import "../Interfaces//Permissionner.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Cleaner.sol";

/**
* Remove a user
*/
contract ActionRemoveUser is Action {

    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param userAddress {address} - Address of the user to remove
    * @param str {bytes32} - unused
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address userAddress, bytes32 str, uint intVal, bytes data) returns (bool){
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access user database
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }

        var userDb = Users(udb);
        //Remove user
        if(userDb.removeUser(userAddress)){
            //Access bank
            address bdb = dg.contracts("bank");
            if(bdb == 0x0){
                return false;
            }
            Cleaner cl = Cleaner(bdb);
            //Empty user account
            return cl.clean(userAddress);
        }
        return false;        
    }
}