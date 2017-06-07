pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";

/**
* Add a new Offer to the database
*/
contract ActionAddOffer is Action{
    /**
    * @notice Add a new Offer
    * @param sender {address} - User who adds the offer
    * @param addr {address} - Unused
    * @param offerName {bytes32} - ID of the offer to add
    * @param reward {uint} - Reward associated with the offer
    * @param offerData {bytes} - Data concerning the offer
    * @return {bool} - Signify if the action went well
    */
    function execute(address sender, address addr, bytes32 offerName, uint reward, bytes offerData) returns (bool){
        if(!isActionManager()) return false;
        
        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);
        
        //Access offer database
        address odb = dg.contracts("offers");
        if(odb == 0x0){
            return false;
        }

        var offerDb = Offers(odb);
        //Add the offer
        return  offerDb.addOffer(offerName, sender, reward, offerData);
    }
}