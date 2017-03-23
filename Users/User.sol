contract User{
    
    address owner;
    bytes32 pseudo;
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
}