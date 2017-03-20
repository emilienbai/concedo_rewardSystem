import "../Interfaces/Users.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionAddUser is Action {

    event ShoutLog(bytes32 message, address addr, uint8 perm);

    function execute(address sender, bytes20 bytesAddress, bytes32 pseudo) returns (bool){
        ShoutLog(" Execute AddUser", newAddr, 101); 
        address userAddress = address(bytesAddress);
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }
        var userDb = Users(udb);
        ShoutLog(pseudo, userAddress, 101); //todo check perm value
        address newAddr = userDb.addUser(userAddress, pseudo);
        ShoutLog(" UserAddr", newAddr, 101); 
        return true;
    }

//todoClean
    function test(address sender, bytes zob){
        ShoutLog("  Hello world", this, 101);
    }
}