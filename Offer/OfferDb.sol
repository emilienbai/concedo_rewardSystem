import "../LinkedList.sol";
import "../Doug/DougEnabled.sol";
import "./Offer.sol";
import "../Validee.sol";

contract OfferDb is LinkedList, Validee{

    event ShoutLog(address addr, bytes32 msg);
        
    function addOffer(bytes32 offerName, address beneficiary, uint reward, bytes data) returns (address){
        if(!validate("addoffer")){
            return 0x0;
        }
  
        address newOffer = address(new Offer(beneficiary, offerName, reward, data));

        _addElement(offerName, newOffer);
        return list[offerName].contractAddress;
    }
    
    function removeOffer(bytes32 offerName) returns (bool){
        if(!validate("removeoffer")){
            return false;
        }
        address offerAddress = list[offerName].contractAddress;
        Offer o = Offer(offerAddress);
        if(o.volunteer() != 0x0) return false;
        
        bool result = _removeElement(offerName);
        
        return result;
    }
    

    function commitTo(bytes32 offerName, address volunteer) returns (bool result){
        if(!validate("committooffer")){
            return false;
        }
        address offerAddress = list[offerName].contractAddress;
        
        if(offerAddress == 0x0) return false;
        Offer o = Offer(offerAddress);
        result = o.commitTo(volunteer);
        if(result) ShoutLog(volunteer, " Yesyesyes");
        else ShoutLog(volunteer, " nonono");
    }

    function claim(bytes32 offerName, address volunteer) returns (bool){
        if(!validate("claimoffer")){
            return false;
        }
        Offer o = Offer(list[offerName].contractAddress);
        return o.claim(volunteer);
    } 

    function confirm(bytes32 offerName, address beneficiary) returns (bool){
        ShoutLog(beneficiary, "  confirmOffer");
        if(!validate("confirmoffer")){
            return false;
        }
        ShoutLog(beneficiary, "  valid");
        Offer o = Offer(list[offerName].contractAddress);
        return o.confirm(beneficiary);
    }

    function getAddress(bytes32 offerName) constant returns (address){
        return list[offerName].contractAddress;
    }
}