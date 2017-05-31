contract Permissionner {

    function perms(address addr) constant returns (uint) { }
    
    function setPermission(address addr, uint perm) returns (bool);

}