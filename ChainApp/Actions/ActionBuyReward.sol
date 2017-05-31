import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Rewards.sol";
import "../Interfaces/Spender.sol";

/**
* Buy a reward
*/
contract ActionBuyReward is Action {

    /**
    * @notice Buy a reward
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Unused
    * @param rewardName {bytes32} - Id of the reward to buy
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 rewardName, uint intVal, bytes data) returns (bool){
        if(!isActionManager()) return false;

        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);
    
        Rewards rewardDb;   //Interface for rewardDB
        Spender bank;       //Interface for Bank

        if(dg.contracts("rewards")!=0x0)
            rewardDb = Rewards(dg.contracts("rewards"));
        else
            return false;
        

        if(dg.contracts("bank")!=0x0)
            bank = Spender(dg.contracts("bank"));
        else
            return false;
        
        uint price;
        address rewarder;
        address buyer;
        //Get rewarder address, buyer and price of the specified reward
        (rewarder, buyer, price) = rewardDb.getData(rewardName);
        
        //If no rewarder specified      OR
        //Someone already bought it     OR
        //Price is null
        if(rewarder == 0x0 || buyer != 0x0 || price == 0) return false;

        //If token transfer failed return false
        if(!bank.send(sender, rewarder, price)) return false;

        if(rewardDb.buy(rewardName, sender)){
            return true;
        } 
        //If marking the reward as bought failed
        //But by design, should not happen
        else {
            //Send the tokens back
            bank.send(rewarder, sender, price);
            return false;
        }
    }
}