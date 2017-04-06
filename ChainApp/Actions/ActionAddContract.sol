import "./Action.sol";
import "../Interfaces/DougInterface.sol";

// Add contract.
contract ActionAddContract is Action {

    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        DougInterface d = DougInterface(DOUG);
        return d.addContract(name,addr);
    }

}