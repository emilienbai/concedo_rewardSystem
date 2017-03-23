import "./ActionManager.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

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

        address contractAddress =  offerDb.getAddress(offerName);

        //TODO Send tokens according

        return offerDb.confirm(offerName, sender);
    }
}