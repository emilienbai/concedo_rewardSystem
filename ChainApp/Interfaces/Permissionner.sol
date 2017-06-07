pragma solidity ^0.4.4;

contract Permissionner {

    function perms(address addr) constant returns (uint) { }
    
    function setPermission(address addr, uint perm) returns (bool);

}