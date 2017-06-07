var burrowC = require('@monax/legacy-contracts');
var fs = require('fs');
var config = require('../config');

function BankManager(contractManager, callback) {

    this.contractData = require('../../jobs_output.json');

    this.contractsManager = contractManager;
    /*Get DOUG*/
    const dougContractAddress = this.contractData["deployDoug"];
    const dougAbi = JSON.parse(fs.readFileSync(config.abiDir + "Doug_ABI.json"));
    this.dougContract = this.contractsManager.newContractFactory(dougAbi).at(dougContractAddress);

    const bankAbi = JSON.parse(fs.readFileSync(config.abiDir + "Bank_ABI.json"));

    this.getBalance = function (userAddress, callback) {
        let contractsManager = this.contractsManager;
        let dougContract = this.dougContract;

        function get(cb) {
            dougContract.contracts("bank", (error, bankAddress) => {
                if (error) return cb(error, null);

                let bankContract = contractsManager.newContractFactory(bankAbi).at(bankAddress);
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