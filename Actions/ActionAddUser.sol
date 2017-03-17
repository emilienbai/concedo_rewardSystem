import "../Interfaces/Users.sol";
import "../Interfaces/Permissionner.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionAddUser is Action {

    event ShoutLog(bytes32 message, address addr, uint8 perm);

    function execute(address sender, bytes20 bytesAddress, bytes32 pseudo, uint8 perm) returns (bool){
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
        ShoutLog(pseudo, userAddress, perm); //todo check perm value
        address newAddr = userDb.addUser(userAddress, pseudo);
        ShoutLog(" UserAddr", newAddr, perm); 
        if(newAddr != 0x0){
            address perms = dg.contracts("perms");
            if(perms == 0x0){
                return false;
            }
            return Permissionner(perms).setPermission(userAddress, perm);
        }
        return false;
    }

//todoClean
    function test(address sender){
        ShoutLog("  Hello world", this, 101);
        ContractProvider dg = ContractProvider(DOUG);
        address udb = dg.contracts("users");
        if(udb == 0x0){
            ShoutLog("  PasUdb", this, 202);
            return;
        }
        ShoutLog("  Hello world", udb, 203);
        var userDb = Users(udb);
        userDb.test();
    }
}