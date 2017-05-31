contract DougEnabled {
    address DOUG;

    /**
    * Set the Doug address
    * @param dougAddr {address} - Address of the doug contract
    * @return {bool} - True if address have been set
    */
    function setDougAddress(address dougAddr) returns (bool result){
        // Once the doug address is set, don't allow it to be set again, except by the
        // doug contract itself.
        if(DOUG != 0x0 && dougAddr != DOUG){
            return false;
        }
        DOUG = dougAddr;
        return true;
    }

    /**
    * Remove the contract - can only be called by DOUG
    */
    function remove(){
        if(msg.sender == DOUG){
            selfdestruct(DOUG);
        }
    }

}