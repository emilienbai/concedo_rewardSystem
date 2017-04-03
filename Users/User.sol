contract User{
    
    address owner;
    address userAddress;
    bytes32 public pseudo;
    uint public perm;
    bytes encryptedData;
    
    function User(address userAddr, bytes32 _pseudo, bytes _encryptedData){
        owner = msg.sender;
        userAddress = userAddr;
        pseudo = _pseudo;
        perm = 0;
        encryptedData = _encryptedData;
    }

    function get() returns(address _owner, bytes32 _pseudo, bytes _encryptedData){
        _owner = owner;
        _pseudo =  pseudo;
        _encryptedData =  encryptedData;
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

    function getData() constant returns (address _userAddress, bytes32 _pseudo, uint _perm, bytes _encryptedData){
        _userAddress = userAddress;
        _pseudo = pseudo;
        _perm = perm;
        _encryptedData = encryptedData;
        return;
    }
}