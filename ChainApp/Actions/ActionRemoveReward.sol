pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/Rewards.sol";

/**
* Remove a reward
*/
contract ActionRemoveReward is Action{

    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Unused
    * @param rewardName {bytes32} - Id of the reward to remove
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 rewardName, uint intVal, bytes data) returns(bool){
        if(!isActionManager()) return false;

        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access reward database
        address rdb = dg.contracts("rewards");
        if(rdb == 0x0) return false;

        var rewardDb = Rewards(rdb);
        //remove reward
        return rewardDb.removeReward(rewardName, sender);
    }
}