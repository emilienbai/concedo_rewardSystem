pragma solidity ^0.4.4;

contract DougInterface {

    function contracts(bytes32 name) returns (address addr);
    
    function addContract(bytes32 name, address addr) returns(bool);
    
    function removeContract(bytes32 name) returns (bool result);

}