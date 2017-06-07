pragma solidity ^0.4.4;

/**
* Contract used to store user data
*/
contract User{
    /**
    * Owner of the contract is the user database
    * A user contract can only be modified through the db
    */
    address owner;

    /**
    * Address of the user to interract with the chain
    * Not the address of this contract
    */
    address userAddress;

    /**
    * User pseudo
    */
    bytes32 public pseudo;

    /**
    * User expected permissions, according to status
    */
    uint expectedPerm;

    /**
    * Actual permission of the user
    */
    uint public perm;

    /**
    * Encrypted informations concerning the user
    */
    bytes encryptedData;
    
    /**
    * @notice Constructor for the user contract
    * Instanciate the attributes
    * @param _userAddress {address} - Address of the user
    * @param _pseudo {bytes32} - Pseudo of the user
    * @param _expectedPerm {uint} - Expected permissions for the newly created user
    * @param _encryptedData {bytes} - data concerning the user
    */
    function User(address _userAddress, bytes32 _pseudo, uint _expectedPerm, bytes _encryptedData){
        owner = msg.sender;
        userAddress = _userAddress;
        pseudo = _pseudo;
        expectedPerm = _expectedPerm;
        perm = 0;
        encryptedData = _encryptedData;
    }

    /**
    * @notice Clean the contract data
    */
    function remove(){
        if(msg.sender != owner) return;
        userAddress = 0x0;
        pseudo = "";
    }

    /**
    * @notice Set user permission
    * @param _perm {uint} - level of permission to set
    * @return {bool} - true if permission have been set
    */
    function setPermission(uint _perm) returns (bool){
        if(msg.sender != owner) return false;
        perm = _perm;
        return true;
    }

    /**
    * @notice Get data concerning this contract
    * @return _userAddress {address}
    * @return _pseudo {bytes32}
    * @return _expectedPerm {uint}
    * @return _perm {uint}
    * @return _encryptedData {bytes}
    */
    function getData() constant returns (address _userAddress, bytes32 _pseudo, uint _expectedPerm, uint _perm, bytes _encryptedData){
        _userAddress = userAddress;
        _pseudo = pseudo;
        _expectedPerm = expectedPerm;
        _perm = perm;
        _encryptedData = encryptedData;
        return;
    }
}