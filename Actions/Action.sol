import "./ActionManagerEnabled.sol";
import "../Validee.sol";

contract Action is ActionManagerEnabled, Validee {
  // Note auto accessor.
  uint8 public permission;

  function setPermission(uint8 permVal) returns (bool) {
    if(!validate("setpermission")){
      return false;
    }
    permission = permVal;
  }

  function execute(address sender, address addr, bytes32 str, uint intVal, bytes data) returns (bool);
}