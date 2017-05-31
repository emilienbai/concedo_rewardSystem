import "./Action.sol";
import "../Interfaces/Users.sol";
import "../Interfaces/ContractProvider.sol";

/**
* Add a new User to the database
*/
contract ActionAddUser is Action {

    /**
    * @notice Add a new User
    * @param sender {address} - User who transacts on the chain
    * @param userAddress {address} - Address of the new user
    * @param pseudo {bytes32} - pseudo of the new user
    * @param expectedPerm {uint} - perm level expected from the new user
    * @param userData {bytes} - Data concerning the new user
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address userAddress, bytes32 pseudo, uint expectedPerm, bytes userData) returns (bool){
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access user database
        address udb = dg.contracts("users");
        if(udb == 0x0){
            return false;
        }
        var userDb = Users(udb);
        //Add the user
        address newAddr = userDb.addUser(userAddress, pseudo, expectedPerm, userData);
        return newAddr != 0x0;
    }
}