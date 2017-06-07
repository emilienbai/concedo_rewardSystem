pragma solidity ^0.4.4;

import "./Action.sol";
import "../Interfaces/DbInterface.sol";

contract ActionClearDb is Action {

    function execute(address sender, address addr, bytes32 name, uint intVal, bytes data) returns (bool) {
        if(!isActionManager()){
            return false;
        }

        ContractProvider d = ContractProvider(DOUG);
        //Clear offers
        address db = d.contracts("offers");
        DbInterface dbi = DbInterface(db);
        dbi.clearDb();

        //Clear rewards
        db = d.contracts("rewards");
        dbi = DbInterface(db);
        dbi.clearDb();

        return true;    
    }
}