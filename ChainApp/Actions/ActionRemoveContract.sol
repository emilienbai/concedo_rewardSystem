import "./Action.sol";
import "../Doug/Doug.sol";

// Remove contract.
contract ActionRemoveContract is Action {

    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        Doug d = Doug(DOUG);
        return d.removeContract(name);
    }

}