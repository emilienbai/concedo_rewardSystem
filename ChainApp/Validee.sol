pragma solidity ^0.4.4;

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
        //Get action DB address
        address adb = ContractProvider(DOUG).contracts("actiondb");
        if(adb == 0x0){
            return false;
        }
        ActionDbInterface adbi = ActionDbInterface(adb);
        //Get action being executed address in action database
        address authorizedAction = adbi.actions(actionName);
        address aa = ContractProvider(DOUG).contracts("activeaction");

        if(aa == 0x0){
            return false;
        }

        //Get currently active action
        address activeAction = ActiveAction(aa).get();

        //Action used have to be one of those which are stored in the action DB
        //AND action execution have to be called through the ActionManager
        if(activeAction == 0x0 || authorizedAction == 0x0){
            return false;
        }
        //Active action have to be the one being executed
        return activeAction == authorizedAction;
    }
}