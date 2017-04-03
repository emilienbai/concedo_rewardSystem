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

    function setPermission(address addr, uint perm) returns (bool){
        if (!validate("setuserpermission")) return false;
        
        address userAddress = list[addr].contractAddress;

        if(userAddress == 0x0) return false;

        User u = User(userAddress);

        return u.setPermission(perm);
    }

    function perms(address userAddr) constant returns (uint){
        address contractAddress = list[userAddr].contractAddress;

        if(contractAddress == 0x0) return 0;

        User u = User(contractAddress);

        return u.perm();
    }
}