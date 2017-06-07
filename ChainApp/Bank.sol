pragma solidity ^0.4.4;

import "./Validee.sol";

/**
* This contract is used to manage tokens for every users
*/
contract Bank is Validee {
  /**
  * Structure storing user balance
  */
  mapping(address => uint) public balance;

  /**
  * @notice Issue coins for a given user designated by address
  * This function only works if called by a "confirmoffer" action
  * @param addr {address} - address of the user to issue tokens 
  * @param amount {uint} - amount of tokens to issue
  * @return {bool} True if tokens have been issued, false otherwise
  */
  function issue(address addr, uint amount) returns (bool) {
    if (!validate("confirmoffer")) 
      return false;
    
    balance[addr] += amount;
    return true;
  }

  /**
  * @notice Send tokens from a user to another one
  * This function only works id called by a "buyreward" action
  * @param from {address} - user who sends tokens
  * @param to {address} - user who receives tokens
  * @param amount {uint} - Amount of token to transfer
  * @return {bool} true if the token have been sent, false if not called by 
  * the right action or not enough tokens from sender
  */
  function send(address from, address to, uint amount) returns (bool){
    if (!validate('buyreward')) 
      return false;

    //Check user ability to send the specified amount
    if (balance[from] <= amount)
      return false;
    
    balance[from] -= amount;
    balance[to] += amount;
    return true;
  }

  /**
  * @notice Clean a user balance when deleting an account
  * This function only works id called by a "removeuser" action
  * @param toClean {address} - adress of the user to clean account balance
  * @return {bool} true if account have been cleaned, false if not called by the right action
  */
  function clean(address toClean) returns (bool){
    if (!validate('removeuser')) 
      return false;

    balance[toClean] = 0;
    return true;
  }
}