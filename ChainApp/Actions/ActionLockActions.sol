import "./Action.sol";
import "../Interfaces/ContractProvider.sol";

/**
* Lock actions. Makes it impossible to run actions for everyone but the owner.
* It is good to unlock the actions manager while replacing parts of the system
* for example.
*/
contract ActionLockActions is Action {

      /**
    * @notice Abstract: Execute the action
    * @param sender {address} - Unused
    * @param addr {address} - Unused
    * @param str {bytes32} - Unused
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 str, uint intval, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address am = dg.contracts("actions");
        if(am == 0x0){
            return false;
        }
        return ActionManager(am).lock();
    }

}