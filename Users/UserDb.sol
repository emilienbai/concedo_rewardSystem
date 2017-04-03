import "./UserList.sol";
import "../Validee.sol";
import "./User.sol";

contract UserDb is UserList, Validee {
   
    function addUser(address userAddress, bytes32 pseudo, bytes encryptedData) returns (address){
        if(!validate("adduser")) return 0x0;
        address newUser = address(new User(userAddress, pseudo, encryptedData));
        
        if(newUser != 0x0){
            _addElement(userAddress, newUser);
        }
        return list[userAddress].contractAddress;
    }
    
    function removeUser(address userAddress) returns (bool){
        if(!validate("removeuser")) return false;

        return _removeElement(userAddress);
    }
}