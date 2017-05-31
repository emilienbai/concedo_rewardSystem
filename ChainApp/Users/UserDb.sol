import "./UserList.sol";
import "../Validee.sol";
import "./User.sol";

/**
* Contract for user database
*/
contract UserDb is UserList, Validee {
   
    /**
    * @notice Add user to user database
    * @param userAddress {address} - Address of the user to add
    * @param pseudo {bytes32} - pseudo of the user
    * @param expectedPerm {uint} - Permission expected for the user
    * @param encryptedData {bytes} - Data of the user
    * @return {address} - Address of the user contract created on the chain
    */
    function addUser(address userAddress, bytes32 pseudo, uint expectedPerm, bytes encryptedData) returns (address){
        if(!validate("adduser")) return 0x0;
        address newUser = address(new User(userAddress, pseudo, expectedPerm, encryptedData));
        
        bool res = false;
        if(newUser != 0x0){
            res = _addElement(userAddress, newUser);
        }
        if(!res){
           return 0x0; 
        }
        else {
            return list[userAddress].contractAddress;
        }
    }
    
    /**
    * @notice Remove a user from the database
    * @param userAddress {address} - Address of the user to remove
    * @return {bool} - True if removed
    */
    function removeUser(address userAddress) returns (bool){
        if(!validate("removeuser")) return false;

        return _removeElement(userAddress);
    }

    /**
    * @notice Set permission level for a user
    * @param addr {address} - Address of the user to set perm
    * @param perm {uint} - level of permission to set
    * @return {bool} - True if the permission have been set
    */
    function setPermission(address addr, uint perm) returns (bool){
        if (!validate("setuserpermission")) return false;
        
        address userAddress = list[addr].contractAddress;

        if(userAddress == 0x0) return false;

        User u = User(userAddress);

        return u.setPermission(perm);
    }

    /**
    * @notice Access the permission level of a user
    * @param userAddr {address} - Address we want the permission level
    * @return {uint} - Level of premission of the user 
    */
    function perms(address userAddr) constant returns (uint){
        address contractAddress = list[userAddr].contractAddress;

        if(contractAddress == 0x0) return 0;

        User u = User(contractAddress);

        return u.perm();
    }
    
    /**
    * @notice Clear the user DB
    */
    function clearDb(){
        if(!validate("clear")){
           return;
        }
        _clear();
    }
}