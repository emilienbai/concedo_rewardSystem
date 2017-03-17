contract Permissionner {
    function perms(address addr) constant returns (uint8) { }
    function setPermission(address addr, uint perm) returns (bool);
}