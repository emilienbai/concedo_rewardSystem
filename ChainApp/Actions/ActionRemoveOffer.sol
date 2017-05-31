import "./Action.sol";
import "../Interfaces/Offers.sol";

/**
* Remove an offer
*/
contract ActionRemoveOffer is Action{

    /**
    * @notice Abstract: Execute the action
    * @param sender {address} - User who transacts on the chain
    * @param addr {address} - Unused
    * @param offerName {bytes32} - Id of the offer to remove
    * @param intVal {uint} - Unused
    * @param data {bytes} - Unused
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 offerName, uint intVal, bytes data)returns (bool){
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);

        //Access offer database
        address odb = dg.contracts("offers");
        if(odb == 0x0) return false;
        
        var offerDb = Offers(odb);

        //Remove the offer
        return offerDb.removeOffer(offerName, sender);
    }
}