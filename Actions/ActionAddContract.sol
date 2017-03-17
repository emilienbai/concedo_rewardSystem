import "./Action.sol";
import "../Doug/Doug.sol";

// Add contract.
contract ActionAddContract is Action {

    function execute(bytes32 name, address addr) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        Doug d = Doug(DOUG);
        return d.addContract(name,addr);
    }

}