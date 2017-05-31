import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

/**
* Claim an offer
*/
contract ActionClaimOffer is Action {
    
    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - unused
    * @param offerName {bytes32} - Id of the offer claimed
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 offerName, uint intVal, bytes data) returns (bool){
        if(!isActionManager()){
            return false;
        }
        ContractProvider dg = ContractProvider(DOUG);
        address odb = dg.contracts("offers");
        if(odb == 0x0) return false;

        var offerDb = Offers(odb);
        return offerDb.claim(offerName, sender);
    }
}