import "./Validee.sol";

contract Bank is Validee {

  mapping(address => uint) public balance;

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
    if(!validate('buyreward')) return false;

    if (balance[from] < amount){
      return false;
    }
    balance[from] -= amount;
    balance[to] += amount;
    return true;
  }

  function clean(address toClean) returns (bool){
      if(!validate('removeuser')) return false;

      balance[toClean] = 0;
      return true;
  }
}