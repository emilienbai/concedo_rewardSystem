import "../Interfaces/Users.sol";
import "../Interfaces//Permissionner.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Cleaner.sol";

contract ActionRemoveUser is Action {

    function execute(address sender, address userAddress, bytes32 str, uint intVal, bytes data) returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }

        var userDb = Users(udb);
        if(userDb.removeUser(userAddress)){
            address bdb = dg.contracts("bank");
            if(bdb == 0x0){
                return false;
            }
            Cleaner cl = Cleaner(bdb);
            return cl.clean(userAddress);
        }
        return false;        
    }
}