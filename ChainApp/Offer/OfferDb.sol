import "../LinkedList.sol";
import "./Offer.sol";
import "../Validee.sol";

contract OfferDb is LinkedList, Validee{
        
    /**
    * @notice Add an offer to the offer database
    * @param offerName {bytes32} - Id of the offer to add
    * @param beneficiary {address} - Creator/beneficiary of the offer
    * @param reward {uint} - reward associated with this offer
    * @param data {bytes} - Date concerning this offer
    * @return {bool} - true if the offer have been added
    */
    function addOffer(bytes32 offerName, address beneficiary, uint reward, bytes data) returns (bool){
        if(!validate("addoffer")){
            return false;
        }
  
        address newOffer = address(new Offer(beneficiary, offerName, reward, data));
        return _addElement(offerName, newOffer, false);
    }
    
    /**
    * @notice Remove an offer from the database - only if no one commited
    * @param offerName {bytes32} - Id of the offer to remove
    * @param sender {address} - Address of the user trying to remove the offer
    * @return {bool} - True if the offer have been removed
    */
    function removeOffer(bytes32 offerName, address sender) returns (bool){
        if(!validate("removeoffer")){
            return false;
        }
        address offerAddress = list[offerName].contractAddress;
        Offer o = Offer(offerAddress);
        if(o.volunteer() != 0x0) return false;
        if(o.beneficiary() == sender){
            return _removeElement(offerName);    
        }
        return false; 
    }
    
    /**
    * @notice Commit to an offer from the database
    * @param offerName {bytes32} - Id of the offer to commit to
    * @param volunteer {address} - Address of the user trying to commit to the offer
    * @return {bool} - True if the user committed
    */
    function commitTo(bytes32 offerName, address volunteer) returns (bool result){
        if(!validate("committooffer")){
            return false;
        }
        address offerAddress = list[offerName].contractAddress;
        
        if(offerAddress == 0x0) return false;
        Offer o = Offer(offerAddress);
        return result = o.commitTo(volunteer);
    }

    /**
    * @notice Claim an offer from the database
    * @param offerName {bytes32} - Id of the offer to claim
    * @param volunteer {address} - Address of the user trying to claim the offer
    * @return {bool} - True if the offer has been claimed
    */
    function claim(bytes32 offerName, address volunteer) returns (bool){
        if(!validate("claimoffer")){
            return false;
        }
        Offer o = Offer(list[offerName].contractAddress);
        return o.claim(volunteer);
    } 

    /**
    * @notice Claim an offer from the database
    * @param offerName {bytes32} - Id of the offer to claim
    * @param beneficiary {address} - Address of the user trying to confirm the offer
    * @return {bool} - True if the offer has been confirmed
    */
    function confirm(bytes32 offerName, address beneficiary) returns (uint, address){
        if(!validate("confirmoffer")){
            return (0, 0x0);
        }
        address offerAddress = list[offerName].contractAddress;
        Offer o = Offer(offerAddress);
        if (o.confirm(beneficiary)){
            return (o.reward(), o.volunteer());
        } else {
            return (0, 0x0);
        }
    }

    /**
    * @notice Unconfirm the offer
    * Only used if token issuing failed
    * @param offerName {bytes32} - Id of the offer to unconfirm
    * @return {bool} - true
    */
    function unConfirm(bytes32 offerName) returns (bool){
        if(!validate("confirmoffer")){
           return false;
        }
        Offer o = Offer(list[offerName].contractAddress);
        return o.unConfirm();
    }

    /**
    * @notice Clear the offer database
    */
    function clearDb(){
        if(!validate("clear")){
           return;
        }
        _clear();
    }

    /**
    * @notice Get the address of an offer contract based on its ID
    * @param offerName {bytes32} - Id of the offer
    * @return {address} - address of the offer contract
    */
    function getAddress(bytes32 offerName) constant returns (address){
        return list[offerName].contractAddress;
    }
}