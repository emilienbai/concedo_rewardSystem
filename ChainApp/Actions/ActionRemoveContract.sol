pragma solidity ^0.4.4;

import "./Action.sol";
import "../Doug/Doug.sol";

/**
* Remove contract from the DOUG
*/
contract ActionRemoveContract is Action {

      /**
    * @notice Abstract: Execute the action
    * @param sender {address} - Unused
    * @param addr {address} - Unused
    * @param name {bytes32} - Name of the contract to remove
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()) return false;
        
        Doug d = Doug(DOUG);
        //remove contract from DOUG
        return d.removeContract(name);
    }

}