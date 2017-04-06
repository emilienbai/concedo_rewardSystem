import "./ActionManagerEnabled.sol";
import "../Validee.sol";

contract Action is ActionManagerEnabled, Validee {
  // Note auto accessor.
  uint public permission;

  function setPermission(uint permVal) returns (bool) {
    if(!validate("setactionpermission")){
      return false;
    }
    permission = permVal;
    return true;
  }

  function execute(address sender, address addr, bytes32 str, uint intVal, bytes data) returns (bool);
}