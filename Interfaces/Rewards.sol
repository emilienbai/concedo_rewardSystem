contract Rewards{

    function addReward(bytes32 rewardName, address rewarder, uint price, bytes data) returns (address);

    function removeReward(bytes32 rewardName) returns (bool);

    function buy(bytes32 rewardName, address buyer) returns (bool);

    function spend(bytes32 rewardName, address sender) returns (bool);

    function getData(bytes32 rewardName) returns(address, address, uint);
}