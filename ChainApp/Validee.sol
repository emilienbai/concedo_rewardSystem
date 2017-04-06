import "./Doug/DougEnabled.sol";
import "./Interfaces/ContractProvider.sol";
import "./Interfaces/ActionDbInterface.sol";
import "./Actions/ActiveAction.sol";



contract Validee is DougEnabled{
    // Makes it easier to check that action manager is the caller.
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