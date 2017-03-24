contract Reward {

    address owner;
    bytes32 rewardName;
    address public rewarder;
    address public buyer;
    uint public price;
    bytes data;

    bool spent = false;

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

    function spend(address sender) returns (bool){
        if(msg.sender != owner) return false;
        if(spent || sender != buyer) return false;
        spent = true;
        return true;
    }
}