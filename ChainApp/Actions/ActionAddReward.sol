pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Rewards.sol";

/**
* Add a new Reward to the database
*/
contract ActionAddReward is Action{

    /**
    * @notice Add a new Reward
    * @param sender {address} - User who adds the reward
    * @param addr {address} - Unused
    * @param rewardName {bytes32} - Id of the reward
    * @param price {uint} - Price of the Reward
    * @param rewardData {bytes} - Data concerning the reward
    * @return {bool} - Signify if the action went well
    */
    function execute (address sender, address addr, bytes32 rewardName, uint price, bytes rewardData) returns (bool){
        if(!isActionManager()) return false;

        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);
        
        //Access reward database
        address rdb = dg.contracts("rewards");
        if (rdb == 0x0) return false;

        var rewardDb = Rewards(rdb);
        //Add the reward
        return rewardDb.addReward(rewardName, sender, price, rewardData);
    }
}