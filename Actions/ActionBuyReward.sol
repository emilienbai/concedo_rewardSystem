import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Rewards.sol";
import "../Interfaces/Spender.sol";

contract ActionBuyReward is Action {

    function execute(address sender, address addr, bytes32 rewardName, uint intVal, bytes data) returns (bool){
        if(!isActionManager()) return false;

        ContractProvider dg = ContractProvider(DOUG);
        Rewards rewardDb;
        Spender bank;
        if(dg.contracts("rewards")!=0x0){
            rewardDb = Rewards(dg.contracts("rewards"));
        } else {
            return false;
        }

        if(dg.contracts("bank")!=0x0){
            bank = Spender(dg.contracts("bank"));
        } else{
            return false;
        }

        uint price;
        address rewarder;
        address buyer;
        (rewarder, buyer, price) = rewardDb.getData(rewardName);
        
        if(rewarder == 0 || buyer != 0x0 || price == 0) return false;

        if(!bank.send(sender, rewarder, price)) return false;

        if(rewardDb.buy(rewardName, sender)){
            return true;
        } else { //Should not happen
            bank.send(rewarder, sender, price);
            return false;
        }
    }
}