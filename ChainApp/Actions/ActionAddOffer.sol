import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

contract ActionAddOffer is Action{

    function execute(address sender, address addr, bytes32 offerName, uint reward, bytes offerData) returns (bool){
        
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address odb = dg.contracts("offers");
        if(odb == 0x0){
            return false;
        }

        var offerDb = Offers(odb);
        return  offerDb.addOffer(offerName, sender, reward, offerData);
    }
}