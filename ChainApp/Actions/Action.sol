pragma solidity ^0.4.4;

import "./ActionManagerEnabled.sol";
import "../Validee.sol";


contract Action is ActionManagerEnabled, Validee {
  uint public permission;

  /**
  * @notice Set the level of required permission to execute this action
  * @param permVal {uint} - Level of required permission to execute the action
  */
  function setPermission(uint permVal) returns (bool) {
    if(!validate("setactionpermission")){
      return false;
    }
    permission = permVal;
    return true;
  }

  /**
  * @notice Abstract: Execute the action
  * @param sender {address} - User who transacts on the chain
  * @param addr {address} - Param of type address
  * @param str {bytes32} - Param of type bytes32
  * @param intVal {uint} - Param of type unsigned int
  * @param data {bytes} - Param of type bytes
  * @return {bool} - Signify if the action went well
  */
  function execute(address sender, address addr, bytes32 str, uint intVal, bytes data) returns (bool);
}