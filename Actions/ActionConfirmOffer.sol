import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";
import "../Interfaces/Issuer.sol";

contract ActionConfirmOffer is Action {

    function execute(address sender, address addr, bytes32 offerName, uint intVal, bytes data) returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address bdb = dg.contracts("bank");
        address odb = dg.contracts("offers");

        if(odb == 0x0) return false;

        var offerDb = Offers(odb);

        uint offerReward;
        address offerVolunteer;

        (offerReward, offerVolunteer) = offerDb.confirm(offerName, sender);
        if (offerReward > 0 && offerVolunteer != 0x0){
            //send tokens
            Issuer bank = Issuer(bdb);
            if (bank.issue(offerVolunteer, offerReward)){
                offerDb.unConfirm(offerName);
                return false;
            } else{
                return true;
            }

        } else{
            return false;
        }
    }
}