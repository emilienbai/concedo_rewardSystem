import "./Doug/DougEnabled.sol";
import "./Interfaces/ContractProvider.sol";
import "./Interfaces/Validator.sol";

contract Validee is DougEnabled{
    // Makes it easier to check that action manager is the caller.
    function validate() internal constant returns (bool) {
        if(DOUG != 0x0){
            address am = ContractProvider(DOUG).contracts("actions");
            if(am == 0x0){
              return false;
            }
            return Validator(am).validate(msg.sender);
        }
        return false;
    }
}