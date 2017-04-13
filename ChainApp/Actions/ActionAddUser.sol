import "../Interfaces/Users.sol";
import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";

contract ActionAddUser is Action {

    function execute(address sender, address userAddress, bytes32 pseudo, uint expectedPerm, bytes userData) returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }
        var userDb = Users(udb);
        address newAddr = userDb.addUser(userAddress, pseudo, expectedPerm, userData);
        return newAddr != 0x0;
    }
}