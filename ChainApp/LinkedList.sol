/**
* This contract defines a Linkedlist structure to store contracts
*/
contract LinkedList {

  /**
  * Define a linkedlist element
  */
  struct Element {
      /**
      * Name of the previous contract
      */
      bytes32 prev;
      /**
      * Name of the next contract
      */
      bytes32 next;
      /**
      * Name of the current contract
      */
      bytes32 contractName;
      /**
      * Address of the current contract
      */
      address contractAddress;
  }

  /**
  * Current size of the list
  */
  uint public size;
  
  /**
  * Current tail element of the linkedlist
  */
  bytes32 public tail;

  /**
  * Current head element of the linkedlist
  */
  bytes32 public head;

  /**
  * Mapping associating contract name with linkedlist element
  */
  mapping (bytes32 => Element) list;

  /**
  * @notice Add a new contract to the linkedList
  * @param name {bytes32} - name of the contract to add
  * @param addr {address} - address of the contract to add
  * @param overwrite {bool} - Define if the new contract can overwrite an existing one
  * @return {bool} - True if the contract have been stored in the list
  */
  function _addElement(bytes32 name, address addr, bool overwrite) internal returns (bool) {
      Element elem = list[name];

      if(elem.contractAddress != 0x0 && !overwrite){
        return false;
      }
      
      elem.contractName = name;
      elem.contractAddress = addr;

      //If list is empty, the inserted contract is both head and tail
      if(size == 0){
        tail = name;
        head = name;
      } 
      else {//Newly inserted contract is considered head
        list[head].next = name;
        list[name].prev = head;
        head = name;
      }
      size++;
       return true;
    }

    /**
    * @notice Remove a contract from the linkedlist
    * @param name {bytes32} - Name of the contract to remove
    * @return {bool} - True if the contract have been removed, false if not existing
    */
    function _removeElement(bytes32 name) internal returns (bool) {
      Element elem = list[name];

      //Return false if the contract does not exist
      if(elem.contractName == ""){
        return false;
      }

      //If only one element is in the list, reset head and tail element
      if(size == 1){
        tail = "";
        head = "";
      } 
      else if (name == head){
        head = elem.prev;
        list[head].next = "";
      } 
      else if(name == tail){
        tail = elem.next;
        list[tail].prev = "";
      } 
      else {
        bytes32 prevElem = elem.prev;
        bytes32 nextElem = elem.next;
        list[prevElem].next = nextElem;
        list[nextElem].prev = prevElem;
      }
      size--;
      delete list[name];
      return true;
  }

  /**
  * @notice Get an element of the list based on its name
  * @param name {bytes32} - Name of the element to retrieve
  * @return prev {bytes32} - name of the previous element in the list
  * @return next {bytes32} - Name of the next contract in the list
  * @return contractName {bytes32} - Name of the retrieved contract
  * @return contractAddress {address} - Address of the retrieved contract
  */
  function getElement(bytes32 name) constant returns (bytes32 prev, bytes32 next, bytes32 contractName, address contractAddress) {
      Element elem = list[name];
      if(elem.contractName == ""){
        return;
      }
      prev = elem.prev;
      next = elem.next;
      contractName = elem.contractName;
      contractAddress = elem.contractAddress;
  }

  /**
  * @notice Clear the list
  */
  function _clear() internal {
    while(tail != ""){
      _removeElement(tail);
    }
  }
}