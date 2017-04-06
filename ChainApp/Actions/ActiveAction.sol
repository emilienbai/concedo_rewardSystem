import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";

contract ActiveAction is DougEnabled{
    address activeAction;

    function get() returns (address){
        return activeAction;
    }

    function set(address newActive) returns (address){
        address am = ContractProvider(DOUG).contracts("actions");
        if(msg.sender != am){
            return activeAction;
        }
        activeAction = newActive;
    }
}