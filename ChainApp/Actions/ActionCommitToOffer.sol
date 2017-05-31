import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

/**
* Commit to an Offer
*/
contract ActionCommitToOffer is Action {

    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Unused
    * @param offerName {bytes32} - Id of the offer
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
        var result = offerDb.commitTo(offerName, sender);
        return result;
    }
}