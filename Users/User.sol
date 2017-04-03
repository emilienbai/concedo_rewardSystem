contract User{
    
    address public owner;
    bytes32 public pseudo;
    bytes encryptedData;
    
    function User(address _owner, bytes32 _pseudo, bytes _encryptedData){
        owner = _owner;
        pseudo = _pseudo;
        encryptedData = _encryptedData;
    }

    function get() returns(address _owner, bytes32 _pseudo, bytes _encryptedData){
        _owner = owner;
        _pseudo =  pseudo;
        _encryptedData =  encryptedData;
    }  

    function remove(){
        owner = 0x0;
        pseudo = "";
    }

    function getData() constant returns (address _owner, bytes32 _pseudo, bytes _encryptedData){
        _owner = owner;
        _pseudo = pseudo;
        _encryptedData = encryptedData;
        return;
    }
}