contract Users{
    function addUser(address userAddress, bytes32 pseudo) returns (address);
    function removeUser(address userAddress) returns (bool);

}