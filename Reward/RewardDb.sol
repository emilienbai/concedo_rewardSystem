import "../LinkedList.sol";
import "./Reward.sol";
import "../Validee.sol";

contract RewardDb is LinkedList, Validee{

    event ShoutLog(address addr, bytes32 msg);

    function addReward(bytes32 rewardName, address rewarder, uint price, bytes data) returns (address){
        if(!validate("addreward")) return 0x0;

        address newReward = address(new Reward(rewarder, rewardName, price, data));

        _addElement(rewardName, newReward);
        return list[rewardName].contractAddress;
    }

    function removeReward(bytes32 rewardName) returns (bool){
        if(!validate("removereward")) return false;

        address rewardAddress = list[rewardName].contractAddress;
        if(rewardAddress == 0x0) return false;

        Reward r = Reward(rewardAddress);
        if(r.buyer() != 0x0) return false;

        return _removeElement(rewardName);
    }

    function buy(bytes32 rewardName, address buyer) returns (bool){
        if(!validate("buyreward")) return false;

        address rewardAddress = list[rewardName].contractAddress;
        if(rewardAddress == 0x0) return false;

        Reward r = Reward(rewardAddress);
        return r.buy(buyer);
    }

    function getData(bytes32 rewardName) constant returns(address rewarder, address buyer, uint price){
        
        address rewardAddress = list[rewardName].contractAddress;
        if(rewardAddress == 0x0) return (0x0, 0x0, 0);

        Reward r = Reward(rewardAddress);
        price = r.price();
        rewarder = r.rewarder();
        buyer = r.buyer();
    }

}