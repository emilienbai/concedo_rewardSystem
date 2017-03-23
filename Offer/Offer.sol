contract Offer{
    
    address public beneficiary; //todo check public does not provide setter
    bytes32 public offerName;
    uint public reward;
    bytes data;
    address public volunteer = 0x0;
    bool claimed = false;
    bool confirmed = false;
    
    function Offer(address _beneficiary, bytes32 _offerName, uint _reward, bytes _data){
        beneficiary = _beneficiary;
        offerName = _offerName;
        reward = _reward;
        data = _data;
    }
    
    
    function commitTo(address _volunteer) returns (bool result){
        if(volunteer != 0x0){ //Someone already commited
            result = false;
        } else if (_volunteer == beneficiary){ //A beneficiary cannot commit to its own offer
            result = false;
        } else {
            volunteer = _volunteer;
            result = true;
        }
    }
    
    function claim(address sender) returns (bool) {
        if(sender == volunteer){
            claimed = true;
        }
        return claimed;
    }
    
    function confirm(address sender) returns (bool) {
        if(volunteer != 0x0 && claimed && sender == beneficiary && !confirmed){
            confirmed = true;
            return true;
        }
        return false;
    }

    function getData() constant returns (address _beneficiary, bytes32 _offerName, uint _reward, 
                    bytes _data, address _volunteer, bool _claimed, bool _confirmed ){
        _beneficiary = beneficiary;
        _offerName = offerName;
        _reward = reward;
        _data = data;
        _volunteer = volunteer;
        _claimed = claimed;
        _confirmed = confirmed;
        return;
    }
}