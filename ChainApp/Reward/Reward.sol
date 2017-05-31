contract Reward {
    /**
    * Adress of the database where the offer is stored
    * Reward can only be modified throught the database
    */
    address owner;

    /**
    * Id of the reward
    */
    bytes32 rewardName;

    /**
    * Address of the creator of the reward
    */
    address public rewarder;

    /**
    * Address of the buyer of the reward
    */
    address public buyer;

    /**
    * Price of the reward
    */
    uint public price;
    
    /**
    * Data concerning the reward 
    */
    bytes data;

    /**
    * @notice Constructor for the reward contract
    * @param _rewarder {address} - Address of the creator of the reward
    * @param _rewardName {bytes32} - Id of the reward to add
    * @param _price {uint} - Price of the reward
    * @param _data {bytes} - Data concerning this reward
    */
    function Reward(address _rewarder, bytes32 _rewardName, uint _price, bytes _data){
        owner = msg.sender;
        rewarder = _rewarder;
        rewardName = _rewardName;
        price = _price;
        data = _data;
    }

    /**
    * @notice Buy this reward - only if not already bought
    * @param _buyer {address} - Address of the user who wants to buy this reward
    * @return {bool} - True if the reward have been bought
    */
    function buy(address _buyer) returns (bool){
        if(msg.sender != owner) return false;
        if(buyer != 0x0){
            return false;
        }
        buyer = _buyer;
        return true;
    }

    /**
    * @notice Get the data concerning this reward
    * @return _rewardName {bytes32}
    * @return _rewarder {address}
    * @return _buyer {address}
    * @return _price {uint}
    * @return _data {bytes} 
    */
    function getData() constant returns (bytes32 _rewardName, address _rewarder,
                    address _buyer, uint _price, bytes _data){
        _rewardName = rewardName;
        _rewarder = rewarder;
        _buyer = buyer;
        _price = price;
        _data = data;
        return;
    }
}