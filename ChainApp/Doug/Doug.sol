import "../LinkedList.sol";
import "./DougEnabled.sol";

contract Doug is LinkedList {

  /**
  * Address of the chain user who put this contract on
  */
  address owner;
    /**
    * Constructor for the DOUG contract
    */
    function Doug(){
        owner = msg.sender;
    }

    /**
    * @notice Add a contract to Doug. This contract should extend DougEnabled, because
    * Doug will attempt to call 'setDougAddress' on that contract before allowing it
    * to register. It will also ensure that the contract cannot be selfdestructed by anyone
    * other than Doug. Finally, Doug allows over-writing of previous contracts with
    * the same name, thus you may replace contracts with new ones.
    * @param name {bytes32} - The name of the contract.
    * @param addr {address} - The address of the actual contract.
    * @return {bool} - showing if the addition succeeded or failed.
    */
    function addContract(bytes32 name, address addr) returns (bool) {
       // Only the owner may add, and the contract has to be DougEnabled and
       // return true when setting the Doug address.
      if(msg.sender != owner){ //TODO add support for actionAddContract
        // Access denied.
        return false;
      }

      if(!DougEnabled(addr).setDougAddress(this)){
        //Structural fail...
        return false;
      }

       // Add to list.
       bool ae = _addElement(name, addr, true);
       return ae;
    }
    /**
    * @notice Remove a contract from doug.
    * @param name {bytes32} - The name of the contract.
    * @return {bool} - showing if the removal succeeded or failed.
    */
    function removeContract(bytes32 name) returns (bool) {
        if(msg.sender != owner){
            return false;
        }
        bool re = _removeElement(name);
        return re;
    }
  
    /**
    * @notice Gets a contract from Doug.
    * @param name {bytes32} - The name of the contract.
    * @return {address} The address of the contract. If no contract with that name exists, it will
    * return zero.
    */
    function contracts(bytes32 name) constant returns (address){
      return list[name].contractAddress;
    }

    /**
    * @notice Remove (selfdestruct) Doug.
    */
    function remove(){
        if(msg.sender == owner){
            // Finally, remove doug. Doug will now have all the funds of the other contracts,
            // and when suiciding it will all go to the owner.
            selfdestruct(owner);
        }
    }
}