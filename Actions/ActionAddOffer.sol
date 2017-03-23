import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";
import "../Interfaces/Issuer.sol";



contract ActionAddOffer is Action{
    event ShoutLog(bytes32 message, address addr, uint reward);

    function execute(address sender, address addr, bytes32 offerName, uint reward, bytes offerData) returns (bool){
        
        
        ShoutLog(" Execute AddOffer", sender, reward);
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address odb = dg.contracts("offers");
        if(odb == 0x0){
            return false;
        }
        ShoutLog("  OfferDbAddress", odb, reward);

        var offerDb = Offers(odb);
        address offerAddress = offerDb.addOffer(offerName, sender, reward, offerData);
        if(offerAddress != 0x0){return true;}
        return false;
    }
}