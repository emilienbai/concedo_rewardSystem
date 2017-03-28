contract Offer{
    
    address owner;
    //owner is the database creating the offer: allow us to check that only offerDB can modify the contract
    address public beneficiary;
    bytes32 public offerName;
    uint public reward;
    bytes data;
    address public volunteer = 0x0;
    bool claimed = false;
    bool confirmed = false;
    uint confirmedOn;
    
    function Offer(address _beneficiary, bytes32 _offerName, uint _reward, bytes _data){
        owner = msg.sender;
        beneficiary = _beneficiary;
        offerName = _offerName;
        reward = _reward;
        data = _data;
    }
    
    
    function commitTo(address _volunteer) returns (bool result) {
        if(msg.sender != owner) return false;
        if(volunteer != 0x0){ //Someone already commited
            result = false;
        } else if (_volunteer == beneficiary){ //A beneficiary cannot commit to its own offer
            result = false;
        } else {
            volunteer = _volunteer;
            result = true;
        }
    }
    
    function claim(address sender) returns (bool){
        if(msg.sender != owner) return false;
        if(sender == volunteer){
            claimed = true;
        }
        return claimed;
    }
    
    function confirm(address sender) returns (bool){
        if(msg.sender != owner) return false;
        if(volunteer != 0x0 && claimed && sender == beneficiary && !confirmed){
            confirmed = true;
            confirmedOn = block.number;
            return true;
        }
        return false;
    }

    function unConfirm() returns(bool){
        if(msg.sender != owner) return false;
        confirmed = false;
        return true;
    }

    function getData() constant returns (address _beneficiary, bytes32 _offerName, uint _reward, 
                    bytes _data, address _volunteer, bool _claimed, bool _confirmed, uint _confirmedOn ){
        _beneficiary = beneficiary;
        _offerName = offerName;
        _reward = reward;
        _data = data;
        _volunteer = volunteer;
        _claimed = claimed;
        _confirmed = confirmed;
        _confirmedOn = confirmedOn;
        return;
    }
}