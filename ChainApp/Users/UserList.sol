/**
 * This contract defines a Linkedlist structure to store user contracts
 */
contract UserList {

    /**
     * Define a linkedlist element
     */
    struct Element {
        /**
         * Name of the previous contract
         */
        address prev;
        /**
         * Name of the next contract
         */
        address next;
        /**
         * Name of the current contract
         */
        address userAddress;
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
    address public tail;

    /**
    * Current head element of the linkedlist
    */
    address public head;

    /**
    * Mapping associating contract name with linkedlist element
    */
    mapping(address => Element) list;

    /**
    * @notice Add a new contract to the linkedList
    * @param userAddress {address} - address of the user to add
    * @param contractAddr {address} - address of the user contract to add
    * @return {bool} True if the contract have been stored in the list
    */
    function _addElement(address userAddress, address contractAddr) internal returns(bool result) {
        Element elem = list[userAddress];

        if (elem.contractAddress != 0x0) { //does not allow to overwrite user
            return false;
        }

        elem.userAddress = userAddress;
        elem.contractAddress = contractAddr;

        //If list is empty, the inserted contract is both head and tail
        if (size == 0) {
            tail = userAddress;
            head = userAddress;
        } 
        else {//Newly inserted contract is considered head
            list[head].next = userAddress;
            list[userAddress].prev = head;
            head = userAddress;
        }
        size++;
        return true;
    }

    /**
    * @notice Remove a user contract from the list
    * @param userAddress {address} - Address of the user to remove
    * @return {bool} - True if removed 
    */
    function _removeElement(address userAddress) internal returns(bool) {
        Element elem = list[userAddress];
        
        //Return false if the contract does not exist
        if (elem.userAddress == 0x0) {
            return false;
        }

        //If only one element is in the list, reset head and tail element
        if (size == 1) {
            tail = 0x0;
            head = 0x0;
        } 
        else if (userAddress == head) {
            head = elem.prev;
            list[head].next = 0x0;
        }
        else if (userAddress == tail) {
            tail = elem.next;
            list[tail].prev = 0x0;
        } 
        else {
            address prevElem = elem.prev;
            address nextElem = elem.next;
            list[prevElem].next = nextElem;
            list[nextElem].prev = prevElem;
        }
        size--;
        delete list[userAddress];
        return true;
    }

    /**
    * @notice Get an element from the list based on its address
    * @param userAddress {address} - Adress of the user to retrieve
    * @return prev {address} - address of the previous element in the list
    * @return next {address} - address of the next contract in the list
    * @return userAddr {address} - address of the user 
    * @return contractAddress {address} - Address of the retrieved user contract
    */
    function getElement(address userAddress) constant returns(address prev, address next, address userAddr, address contractAddress) {
        Element elem = list[userAddress];
        if (elem.userAddress == 0x0) {
            return;
        }
        prev = elem.prev;
        next = elem.next;
        userAddr = elem.userAddress;
        contractAddress = elem.contractAddress;
    }

    /**
    * @notice Clear the list
    */
    function _clear() internal {
        while (tail != 0x0) {
            _removeElement(tail);
        }
    }
}