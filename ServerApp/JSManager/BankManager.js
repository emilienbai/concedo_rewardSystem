var erisC = require('eris-contracts');
var fs = require('fs');
var config = require('../config');

function BankManager(contractManager, callback) {

    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractManager;
    /*Get DOUG*/
    let dougContractAddress = this.contractData["deployDoug"];
    let dougAbi = JSON.parse(fs.readFileSync(config.abiDir + dougContractAddress));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    this.dougContract.contracts("bank", (error, bankAddress) => {
        if (error) {
            return null;
        }
        let bankCurrentAddress = bankAddress;
        /*Get ABI */
        let bankContractAddress = this.contractData["deployBank"];
        let bankAbi = JSON.parse(fs.readFileSync(config.abiDir + bankContractAddress)); //TODO check if works

        this.bankContract = this.contractsManager.newContractFactory(bankAbi).at(bankContractAddress);
        callback();
    });

    this.getBalance = function (userAddress, callback) {
        this.bankContract.balance(userAddress, (error, result) => {
            if (error) console.error(error);
            //console.log(result);
            callback(result);
        })
    }
}

module.exports = {
    BankManager: BankManager
}