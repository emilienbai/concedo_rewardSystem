import "../Doug/DougEnabled.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionManagerEnabled is DougEnabled {
    /**
    * @notice check if an action have been called by the action manager
    * @return {bool} - True if fill condition
    */
    function isActionManager() internal constant returns (bool) {
        if(DOUG != 0x0){
            //Access action manager address in DOUG
            address am = ContractProvider(DOUG).contracts("actions");
            //Check the caller is the right action manager
            if (msg.sender == am)
                return true;
        }
        return false;
    }
}