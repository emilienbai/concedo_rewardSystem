pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/ContractProvider.sol";
import "../Interfaces/Offers.sol";
import "../Interfaces/Issuer.sol";

/**
* Confirm an Offer
*/
contract ActionConfirmOffer is Action {

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
        if(!isActionManager()) return false;

        //Access DOUG contract
        ContractProvider dg = ContractProvider(DOUG);
        address bdb = dg.contracts("bank");
        address odb = dg.contracts("offers");

        if(odb == 0x0) return false;
        var offerDb = Offers(odb);

        uint offerReward;
        address offerVolunteer;

        //Confirm the offer
        //It returns the amount of the reward and the address of the volunteer
        //(0, 0x0) is returned if 'confirm' failed
        (offerReward, offerVolunteer) = offerDb.confirm(offerName, sender);

        //Check if 'commit' worked
        if (offerReward > 0 && offerVolunteer != 0x0){
            //Send tokens to volunteer
            Issuer bank = Issuer(bdb);
            if (!bank.issue(offerVolunteer, offerReward)){
                //If issuing failed, un-confirm offer
                offerDb.unConfirm(offerName);
                return false;
            } else{
                return true;
            }
        } else{
            //Commit failed
            return false;
        }
    }
}