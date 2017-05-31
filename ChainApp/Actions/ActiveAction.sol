import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";

/**
* Define the action currently used by the chain
*/
contract ActiveAction is DougEnabled{
    address activeAction;

    /**
    * @notice Get the address of the current active action
    * @return {address} - current active action address
    */
    function get() constant returns (address){
        return activeAction;
    }

    /**
    * @notice Set the address of current active action
    * @param newActive {address} - Address of the new Active action
    * @return {address} - Address of the active action
    */
    function set(address newActive) returns (address){
        address am = ContractProvider(DOUG).contracts("actions");
        if(msg.sender != am){
            return activeAction;
        }
        activeAction = newActive;
        return activeAction;
    }
}