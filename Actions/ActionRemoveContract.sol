import "./Action.sol";
import "../Doug/Doug.sol";

// Remove contract.
contract ActionRemoveContract is Action {

    function execute(bytes32 name) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        Doug d = Doug(DOUG);
        return d.removeContract(name);
    }

}