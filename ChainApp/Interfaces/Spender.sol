pragma solidity ^0.4.4;

contract Spender{

    mapping(address => uint) public balance;
    
    function send(address from, address to, uint amount) returns (bool);

}