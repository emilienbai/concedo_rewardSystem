import "../LinkedList.sol";
import "./Reward.sol";
import "../Validee.sol";

contract RewardDb is LinkedList, Validee{

    /**
    * @notice Add a reward to the reward database
    * @param rewardName {bytes32} - Id of the reward to add
    * @param rewarder {address} - Address of the creator of the reward
    * @param price  {uint} - Price of the reward
    * @param data {bytes} - Data concerning this reward
    * @return {bool} - True if the reward have been added
    */
    function addReward(bytes32 rewardName, address rewarder, uint price, bytes data) returns (bool){
        if(!validate("addreward")) return false;

        address newReward = address(new Reward(rewarder, rewardName, price, data));

        return _addElement(rewardName, newReward, false);
    }

    /**
    * @notice Remove a reward from the database - only if not bought
    * @param rewardName {bytes32} - Id of the reward to remove
    * @param sender {address} - Address of the user trying to remove the reward
    * @return {bool} - True if the reward have been removed
    */
    function removeReward(bytes32 rewardName, address sender) returns (bool){
        if(!validate("removereward")) return false;

        address rewardAddress = list[rewardName].contractAddress;
        if(rewardAddress == 0x0) return false;

        Reward r = Reward(rewardAddress);
        if(r.buyer() != 0x0) return false;
        
        if(sender == r.rewarder()){
            return _removeElement(rewardName);
        }
        return false;
    }

    /**
    * @notice Buy a reward
    * @param rewardName {bytes32} - Id of the reward being bought
    * @param buyer {address} - Address of the user trying to buy the reward
    * @return {bool} - True if the reward was not already bought and buyer have enough funds
    */
    function buy(bytes32 rewardName, address buyer) returns (bool){
        if(!validate("buyreward")) return false;

        address rewardAddress = list[rewardName].contractAddress;
        if(rewardAddress == 0x0) return false;

        Reward r = Reward(rewardAddress);
        return r.buy(buyer);
    }

    /**
    * @notice Get the address of a reward contract based on its ID
    * @param rewardName {bytes32} - Id of the reward we want the contract address
    * @return {address} - Address of the matching reward contract
    */
    function getAddress(bytes32 rewardName) constant returns (address){
        return list[rewardName].contractAddress;
    }

    /**
    * @notice Get interesting data concerning a reward
    * @param rewardName {bytes32} - Id of the reward
    * @return rewarder {address} - Address of the creator of the reward
    * @return buyer {address} - Address of the buyer of the reward
    * @return price {uint} - Price of the reward
    */
    function getData(bytes32 rewardName) constant returns(address rewarder, address buyer, uint price){
         
         address rewardAddress = list[rewardName].contractAddress;
         if(rewardAddress == 0x0) return (0x0, 0x0, 0);

         Reward r = Reward(rewardAddress);
         price = r.price();
         rewarder = r.rewarder();
         buyer = r.buyer();   
    }
   
    /**
    * @notice Clear the reward database
    */
    function clearDb(){
        if(!validate("clear")){
           return;
        }
        _clear();
    }
}