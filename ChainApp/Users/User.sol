contract User{
    
    address owner;
    address userAddress;
    bytes32 public pseudo;
    uint expectedPerm;
    uint public perm;
    bytes encryptedData;
    
    function User(address userAddr, bytes32 _pseudo, uint _expectedPerm, bytes _encryptedData){
        owner = msg.sender;
        userAddress = userAddr;
        pseudo = _pseudo;
        expectedPerm = _expectedPerm;
        perm = 0;
        encryptedData = _encryptedData;
    }

    function remove(){
        if(msg.sender != owner) return;
        userAddress = 0x0;
        pseudo = "";
    }

    function setPermission(uint _perm) returns (bool){
        if(msg.sender != owner) return false;
        perm = _perm;
        return true;
    }

    function getData() constant returns (address _userAddress, bytes32 _pseudo, uint _expectedPerm, uint _perm, bytes _encryptedData){
        _userAddress = userAddress;
        _pseudo = pseudo;
        _expectedPerm = expectedPerm;
        _perm = perm;
        _encryptedData = encryptedData;
        return;
    }
}