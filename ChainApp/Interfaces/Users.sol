contract Users{

    function addUser(address userAddress, bytes32 pseudo, uint expectedPerm, bytes data) returns (address);
    
    function removeUser(address userAddress) returns (bool);

}