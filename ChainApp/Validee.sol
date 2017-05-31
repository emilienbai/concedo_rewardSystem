import "./Doug/DougEnabled.sol";
import "./Interfaces/ContractProvider.sol";
import "./Interfaces/ActionDbInterface.sol";
import "./Actions/ActiveAction.sol";

/**
* Contract that check the calling action
*/
contract Validee is DougEnabled{

    /**
    * @notice Check that the specified action is indeed the caller
    * @param actionName {bytes32} - Name of the action that should be the caller
    * @return {bool} - true if the specified action is the caller 
    */
    function validate(bytes32 actionName) internal constant returns (bool) {
        if(DOUG == 0x0){
            return false;
        }

        address adb = ContractProvider(DOUG).contracts("actiondb");
        if(adb == 0x0){
            return false;
        }

        ActionDbInterface adbi = ActionDbInterface(adb);
        address authorizedAction = adbi.actions(actionName);
        address aa = ContractProvider(DOUG).contracts("activeaction");

        if(aa == 0x0){
            return false;
        }

        address activeAction = ActiveAction(aa).get();
        return activeAction == authorizedAction;
    }
}