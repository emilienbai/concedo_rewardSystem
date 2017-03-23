import "./Validee.sol";

contract Bank is Validee {

  mapping(address => uint) balance;

  // Issue coins for an address.
  function issue(address addr, uint amount) returns (bool) {
    if(!validate("confirmoffer")){
      return false;
    }
    balance[addr] += amount;
    return true;
  }

  // spend an account 'amount' number of coins.
  function send(address from, address to, uint amount) returns (bool){
    if (balance[from] < amount){
      return false;
    }
    balance[from] -= amount;
    balance[to] += amount;
    return true;
  }
}