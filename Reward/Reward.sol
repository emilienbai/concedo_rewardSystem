contract Reward {

    address owner;
    bytes32 rewardName;
    address public rewarder;
    address public buyer;
    uint public price;
    bytes data;

    function Reward(address _rewarder, bytes32 _rewardName, uint _price, bytes _data){
        owner = msg.sender;
        rewarder = _rewarder;
        rewardName = _rewardName;
        price = _price;
        data = _data;
    }

    function buy(address _buyer) returns (bool){
        if(msg.sender != owner) return false;
        if(buyer != 0x0){
            return false;
        }
        buyer = _buyer;
        return true;
    }

    function getData() constant returns (address _owner, bytes32 _rewardName, address _rewarder,
                    address _buyer, uint _price, bytes _data){
        _owner = owner;
        _rewardName = rewardName;
        _rewarder = rewarder;
        _buyer = buyer;
        _price = price;
        _data = data;
        return;
    }
}