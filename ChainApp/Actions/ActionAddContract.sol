import "./Action.sol";
import "../Interfaces/DougInterface.sol";

/**
* Add a new contract to the DOUG
*/
contract ActionAddContract is Action {

    /**
    * @notice Add a new contract to the DOUG
    * @param sender {address} - Unused
    * @param addr {address} - Address of the contract to add
    * @param name {bytes32} - Name of the contract to add
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()) return false;
        
        DougInterface d = DougInterface(DOUG);
        return d.addContract(name,addr);
    }
}