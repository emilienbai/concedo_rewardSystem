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

    this.getBalance = function (userAddress, callback) {
        let contractData = this.contractData;
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        function get(cb) {
            dougContract.contracts("bank", (error, bankAddress) => {
                if (error) return cb(error, null);
                let bankCurrentAddress = bankAddress;
                //Get ABI 
                let bankContractAddress = contractData["deployBank"];
                let bankAbi = JSON.parse(fs.readFileSync(config.abiDir + bankContractAddress)); //TODO check if works

                let bankContract = contractsManager.newContractFactory(bankAbi).at(bankContractAddress);
                bankContract.balance(userAddress, (error, result) => {
                    cb(error, result);
                })
            })
        }

        if (callback) {
            get(callback);
        } else {
            return new Promise((resolve, reject) => {
                get((error, result) => {
                    if (error) reject(error);
                    else resolve(result.toNumber());
                })
            })
        }
    }
}

module.exports = {
    BankManager: BankManager
}