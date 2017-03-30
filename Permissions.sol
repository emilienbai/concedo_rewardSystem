import "./Validee.sol";

// The Permissions contract
contract Permissions is Validee {

    // This is where we keep all the permissions.
    mapping (address => uint) public perms;

    function setPermission(address addr, uint perm) returns (bool) {
      if (!validate("setuserpermission")){
        return false;
      }
      perms[addr] = perm;
      return true;
    }

}