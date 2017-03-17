import "./ActionManagerEnabled.sol";
import "../Validee.sol";

contract Action is ActionManagerEnabled, Validee {
  // Note auto accessor.
  uint8 public permission;

  function setPermission(uint8 permVal) returns (bool) {
    if(!validate()){
      return false;
    }
    permission = permVal;
  }
}