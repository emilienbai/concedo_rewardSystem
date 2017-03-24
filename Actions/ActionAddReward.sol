import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Rewards.sol";

contract ActionAddReward is Action{

    function execute (address sender, address addr, bytes32 rewardName, uint price, bytes rewardData) returns (bool){
        if(!isActionManager()) return false;

        ContractProvider dg = ContractProvider(DOUG);
        address rdb = dg.contracts("rewards");
        if (rdb == 0x0) return false;

        var rewardDb = Rewards(rdb);
        address rewardAddress = rewardDb.addReward(rewardName, sender, price, rewardData);
        if(rewardAddress != 0x0) return true;
        return false;
    }
}