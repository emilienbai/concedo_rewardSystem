import "./ActionManager.sol";
import "../Interfaces/Offers.sol";

contract ActionRemoveOffer is Action{

    function execute(address sender, address addr, bytes32 offerName, uint intVal, bytes data)returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address odb = dg.contracts("offers");
        if(odb == 0x0){
            return false;
        }
        var offerDb = Offers(odb);
        return offerDb.removeOffer(offerName);
    }
}