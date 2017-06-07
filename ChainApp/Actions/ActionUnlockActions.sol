pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/ContractProvider.sol";

/**
* Unlock actions. Makes it possible for everyone to run actions.
*/
contract ActionUnlockActions is Action {
    
    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Unused
    * @param str {bytes32} - Unused
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 str, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access action manager
        address am = dg.contracts("actions");
        if(am == 0x0){
            return false;
        }

        //Unlock action manager
        return ActionManager(am).unlock();
    }
}