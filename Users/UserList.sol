//The User database contract.
contract UserList {

     // List element
  struct Element {
    address prev;
    address next;
    // Data
    address userAddress;
    address contractAddress;
  }

  uint public size;
  address public tail;
  address public head;
    mapping (address => Element) list;

  // Add a new contract. This will overwrite an existing contract. 'internal' modifier means
  // it has to be called by an implementing class.
  function _addElement(address userAddress, address contractAddr) internal returns (bool result) {
        Element elem = list[userAddress];

        if(elem.contractAddress != 0x0){//does not allow to overwrite user
            return false;
        }

        elem.userAddress = userAddress;
        elem.contractAddress = contractAddr;

        // Two cases - empty or not.
        if(size == 0){
            tail = userAddress;
            head = userAddress;
        } else {
            list[head].next = userAddress;
            list[userAddress].prev = head;
            head = userAddress;
        }
        size++;
        return true;
    }

    // Remove a contract from Users (we could also selfdestruct the contract if we want to).
    function _removeElement(address userAddress) internal returns (bool result) {

       Element elem = list[userAddress];
        if(elem.userAddress == 0x0){
            return false;
        }

        if(size == 1){
            tail = 0x0;
            head = 0x0;
        } else if (userAddress == head){
            head = elem.prev;
            list[head].next = 0x0;
        } else if(userAddress == tail){
            tail = elem.next;
            list[tail].prev = 0x0;
        } else {
            address prevElem = elem.prev;
            address nextElem = elem.next;
            list[prevElem].next = nextElem;
            list[nextElem].prev = prevElem;
        }
        size--;
        delete list[userAddress];
        return true;
  }

  function getElement(address userAddress) constant returns (address prev, address next, address userAddr, address contractAddress) {

      Element elem = list[userAddress];
      if(elem.userAddress == 0x0){
        return;
      }
      prev = elem.prev;
      next = elem.next;
      userAddr = elem.userAddress;
      contractAddress = elem.contractAddress;
  }
}