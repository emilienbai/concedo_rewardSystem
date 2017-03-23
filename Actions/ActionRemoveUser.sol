import "../Interfaces/Users.sol";
import "../Interfaces//Permissionner.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionRemoveUser is Action {
    event ShoutLog(bytes32 message, address addr);

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
        bool result = userDb.removeUser(userAddress);
        
        if(result) ShoutLog("  Supprimé", userAddress);
        else ShoutLog("  EchecSuppr", userAddress);

        if(result){
            address perms = dg.contracts("perms");
            if(perms == 0x0){
                return false;
            }
            return Permissionner(perms).setPermission(userAddress, 0);
        }
        return false;
    }

    //todoClean
    function test(address sender){
        ShoutLog("  Hello remove1", this);
    }
}