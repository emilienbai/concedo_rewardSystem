import "./LinkedList.sol";
import "./Validee.sol";

contract Offer{
    
    address beneficiary;
    bytes32 offerName;
    bytes data;
    address volunteer = 0x0;
    bool claimed = false;
    
    function Offer(address _beneficiary, bytes32 _offerName){
        beneficiary = _beneficiary;
        offerName = _offerName;
    }
    
    function setData(bytes _data){
        data = _data;
    }
    
    function commitTo(address _volunteer) returns (bool){
        if(volunteer != 0x0){
            return false;
        } else {
            volunteer = _volunteer;
            return true;
        }
    }
    
    function claim() returns (bool) {
        if(volunteer != 0x0){
            claimed = true;
        }
        return claimed;
    }
    
    function confirm() returns (bool) {
        if(volunteer != 0x0 && claimed){
            //TODO send tokens and remove contract
        }
    }
    
    function remove(){
        //TODO
    }
}

contract OfferDb is LinkedList, Validee{
    
    function addOffer(bytes32 offerName, address beneficiary) returns (bool){
        if(!validate()){
            return false;
        }
        
        address newOffer = address(new Offer(beneficiary, offerName));
        bool result = _addElement(offerName, newOffer);
        return result;
    }
    
    function removeOffer(bytes32 offerName) returns (bool){
        if(!validate()){
            return false;
        }
        
        bool result = _removeElement(offerName);
        
        return result;
    }
    
    function offer(bytes32 offerName) returns (address){
        return list[offerName].contractAddress;
    }
}