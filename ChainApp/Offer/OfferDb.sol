import "../LinkedList.sol";
import "./Offer.sol";
import "../Validee.sol";

contract OfferDb is LinkedList, Validee{
        
    function addOffer(bytes32 offerName, address beneficiary, uint reward, bytes data) returns (bool){
        if(!validate("addoffer")){
            return false;
        }
  
        address newOffer = address(new Offer(beneficiary, offerName, reward, data));

        return _addElement(offerName, newOffer, false);
    }
    
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
    

    function commitTo(bytes32 offerName, address volunteer) returns (bool result){
        if(!validate("committooffer")){
            return false;
        }
        address offerAddress = list[offerName].contractAddress;
        
        if(offerAddress == 0x0) return false;
        Offer o = Offer(offerAddress);
        return result = o.commitTo(volunteer);
    }

    function claim(bytes32 offerName, address volunteer) returns (bool){
        if(!validate("claimoffer")){
            return false;
        }
        Offer o = Offer(list[offerName].contractAddress);
        return o.claim(volunteer);
    } 

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

    function unConfirm(bytes32 offerName) returns (bool){
        if(!validate("confirmoffer")){
           return false;
        }
        Offer o = Offer(list[offerName].contractAddress);
        return o.unConfirm();
    }

    function clearDb(){
        if(!validate("clear")){
           return;
        }
        _clear();
    }

    function getAddress(bytes32 offerName) constant returns (address){
        return list[offerName].contractAddress;
    }
}