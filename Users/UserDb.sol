import "../Validee.sol";
import "./User.sol";

contract UserDb is Validee {
    mapping (address => User) public users;

    event ShoutLog(bytes32 indexed message);
    
    function addUser(address userAddress, bytes32 pseudo) returns (address){
        ShoutLog("  Calling adduser");
        if(!validate()){
            return 0x0;
        }
        address newUser = address(new User(userAddress, pseudo));
        if(newUser != 0x0){
            users[userAddress] = User(newUser);
        }
        return newUser;
    }
    
    function removeUser(address userAddress) returns (bool){
        ShoutLog("  Calling removeUser");
        if(!validate()){
            return false;
        }
        users[userAddress].remove();
        users[userAddress] = User(0x0);
        return true;
    }

    function test(){
        ShoutLog("  Hello World");
    }
}