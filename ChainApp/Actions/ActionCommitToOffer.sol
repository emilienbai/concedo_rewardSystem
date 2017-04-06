import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

contract ActionCommitToOffer is Action {

    event ShoutLog(address addr, bytes32 msg);

    function execute(address sender, address addr, bytes32 offerName, uint intVal, bytes data) returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address odb = dg.contracts("offers");
        if(odb == 0x0) return false;

        var offerDb = Offers(odb);
        var result = offerDb.commitTo(offerName, sender);
        if (result) ShoutLog(sender, " ohYeah!");
        else ShoutLog(sender, " ohNooo!");
        return result;
    }
}