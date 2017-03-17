import "./Action.sol";
import "../Doug/Doug.sol";

// Add contract.
contract ActionAddContract is Action {

    function execute(address sender, bytes32 name, bytes20 bytesAddr) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        address addr = address(bytesAddr);
        Doug d = Doug(DOUG);
        return d.addContract(name,addr);
    }

}