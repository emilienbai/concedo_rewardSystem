contract Offer{ 
    /**
    * Adress of the database where the offer is stored
    * Offer can only be modified throught the database
    */
    address owner;

    /**
    * Beneficiary of the offer - creator of the contract
    */
    address public beneficiary;

    /**
    * Id of the offer contract
    */
    bytes32 public offerName;

    /**
    * Amount of the reward granted for executing this task offer
    */
    uint public reward;

    /**
    * Data concerning this offer
    */
    bytes data;

    /**
    * Volunteer who committed to this offer
    */
    address public volunteer = 0x0;

    /**
    * Define state of the task offer - claimed
    */
    bool claimed = false;

    /**
    * Define state of the task offer - confirmed
    */
    bool confirmed = false;

    /**
    * Id of the block where the offer have been confirmed
    */
    uint confirmedOn = 0;
    
    /**
    * @notice Constructor for the offer contract
    * @param _beneficiary {address} - Creator/beneficiary of the offer
    * @param _offerName {bytes32} - id of the offer
    * @param _reward {uint} - reward associated with this offer
    * @param _data {bytes} - Date concerning this offer
    */
    function Offer(address _beneficiary, bytes32 _offerName, uint _reward, bytes _data){
        owner = msg.sender;
        beneficiary = _beneficiary;
        offerName = _offerName;
        reward = _reward;
        data = _data;
    }
    
    /**
    * @notice Commit a volunteer to this offer
    * @param _volunteer {address} - Address of the volunteer who commits
    * @return {bool} - true if commit worked
    */
    function commitTo(address _volunteer) returns (bool) {
        if(msg.sender != owner) return false;
        //Someone already commited
        if(volunteer != 0x0){ 
            return false;
        } 
        //A beneficiary cannot commit to its own offer
        //If permission are correctly set, should not happen
        else if (_volunteer == beneficiary){ 
            return false;
        } 
        else {
            volunteer = _volunteer;
            return true;
        }
    }
    
    /**
    * @notice Set this offer in claimed status
    * @param sender {address} - Address of the user who claims the offer
    * @return {bool} - Claimed state of the offer
    */
    function claim(address sender) returns (bool){
        if(msg.sender != owner) return false;
        //Only volunteer who committed can claim the offer
        if(sender == volunteer && !claimed){
            claimed = true;
            return true;
        }
        else {
            return false;
        }
    }
    
    /**
    * @notice Confirm this offer
    * @param sender {address} - Address of the user who confirms the offer
    * @return {bool} - Tru if the offer have been confirmed
    */
    function confirm(address sender) returns (bool){
        if(msg.sender != owner) return false;
        //A volunteer committed                             AND
        //He claimed the offer                              AND
        //The creator of the offer is trying to confirm it  AND
        //The offer have not already been confirmed
        if(volunteer != 0x0 && claimed && sender == beneficiary && !confirmed){
            confirmed = true;
            confirmedOn = block.number;
            return true;
        }
        return false;
    }

    /**
    * @notice Unconfirm the offer
    * Only used if token issuing failed
    * @return {bool} - true
    */
    function unConfirm() returns(bool){
        if(msg.sender != owner) return false;
        confirmed = false;
        return true;
    }

    /**
    * @notice Get the data concerning this offer
    * @return _beneficiary {address}
    * @return _offerName {bytes32}
    * @return _reward {uint}
    * @return _data {bytes}
    * @return _volunteer {address}
    * @return _claimed {bool}
    * @return _confirmed {bool}
    * @return _confirmedOn {uint}
    */
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