import "./ActionManager.sol";
import "../Interfaces/Rewards.sol";

contract ActionRemoveReward is Action{

    function execute(address sender, address addr, bytes32 rewardName, uint intVal, bytes data) returns(bool){
        if(!isActionManager()) return false;

        ContractProvider dg = ContractProvider(DOUG);
        address rdb = dg.contracts("rewards");
        if(rdb == 0x0) return false;

        var rewardDb = Rewards(rdb);
        return rewardDb.removeReward(rewardName, sender);
    }
}