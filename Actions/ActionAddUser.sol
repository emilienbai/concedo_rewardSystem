import "../Interfaces/Users.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionAddUser is Action {

    event ShoutLog(bytes32 message, address addr, uint8 perm);

    function execute(address sender, address userAddress, bytes32 pseudo, uint intVal, bytes userData) returns (bool){
        ShoutLog(" Execute AddUser", userAddress, 101); 
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }
        var userDb = Users(udb);
        address newAddr = userDb.addUser(userAddress, pseudo, userData);
        return true;
    }

//todoClean
    function test(address sender, bytes zob){
        ShoutLog("  Hello world", this, 101);
    }
}