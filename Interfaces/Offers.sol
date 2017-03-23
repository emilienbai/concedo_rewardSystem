contract Offers {

    function addOffer(bytes32 offerName, address beneficiary, uint reward, bytes data) returns (address);
    
    function removeOffer(bytes32 offerName) returns (bool);
    
    function commitTo(bytes32 offerName, address volunteer) returns (bool);

    function claim(bytes32 offerName, address volunteer) returns (bool);

    function confirm(bytes32 offerName, address beneficiary) returns (bool);

    function getAddress(bytes32 offerName) returns (address);
}