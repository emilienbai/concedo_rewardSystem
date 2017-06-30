var ed25519 = require('ed25519');
var config = require('../config');
var canonicalJson = require('canonical-json');
var ramda = require('ramda');
var edbFactory = require('@monax/legacy-db');

const TxType = {
    Send: 0x01,
    Call: 0x02,
    Name: 0x03,
    Bond: 0x11,
    UnBond: 0x12,
    Rebond: 0x13,
    Dupeout: 0x14,
    Perm: 0x20
}

const PermValue = {
    Root: 0x01,
    Send: 0x02,
    Call: 0x04,
    createContract: 0x08,
    CreateAccount: 0x10,
    Bond: 0x20,
    Name: 0x40,
    HasBase: 0x80,
    SetBase: 0x0100,
    UnsetBase: 0x0200,
    SetGlobal: 0x0400,
    HasRole: 0x0800,
    AddRole: 0x1000,
    RmRole: 0x2000,
}

const edb = edbFactory.createInstance(config.erisdbURL);
const accounts = edb.accounts();
const blockchain = edb.blockchain();
const transactions = edb.txs();


/**
 * Get the ID of the blockchain
 */
function getChainID() {
    return new Promise((resolve, reject) => {
        blockchain.getInfo((error, chainID) => {
            if (error) reject(error);
            else resolve(chainID.chain_id)
        })
    })
}

/**
 * Get sequence value for a given address
 * Usefull for signing transactions 
 * @param {String} address - Adress of the account which will send the transaction
 */
function getSequence(address) {
    return new Promise((resolve, reject) => {
        accounts.getAccount(address, (error, value) => {
            if (error) reject(error);
            else resolve(value.sequence);
        })
    })
}

/**
 * Concatenate bytes to sign in a transaction into a string
 * @param {String} chainId - ID of the chain
 * @param {int} type - Type of transaction
 * @param {Object} args - Arguments of the transaction
 * @param {Object} input - Input params of the transaction
 */
function writeSignBytes(chainId, type, args, input) {
    return '{"chain_id":' + canonicalJson(chainId) + ',"tx":[' +
        canonicalJson(type) + ',{"args":"' + canonicalJson(args) + '","input":' +
        canonicalJson(input) + '}]}'
}

/**
 * Convert a string to a Uint8Array object
 * @param {String} str - String to convert
 */
function stringToArrayBuffer(str) {
    var utf8 = unescape(encodeURIComponent(str));
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = utf8.charCodeAt(i);
    }
    return bufView;
}

/**
 * Return signature for a given transaction
 * @param {Uint8Array} bytestoSign - Transaction to sign
 * @param {String} privKey - Private key used to sign
 */
function signTx(bytestoSign, privKey) {
    var signature = ed25519.Sign(new Buffer(bytestoSign, 'utf8'), new Buffer(privKey, "hex"))
    return signature.toString('hex');
}

/**
 * Assemble transaction object
 * @param {int} type - type of the transaction
 * @param {Object} input - input args of the transaction
 * @param {Object} args - data args of the transaction
 * @param {String} signature - Signature of the transaction
 */
function assembleTx(type, input, args, signature) {
    sig = [1, signature.toString('hex')];
    return [type, {
        input: ramda.assoc('signature', sig, input),
        args: args
    }]
}

/**
 * Create a permission transaction on the chain
 * @param {*} pAddr - Address of the user setting the permission 
 * @param {*} privKey - Private key used to sign 
 * @param {String} dAddr - Adress of the premission receiver 
 * @param {Uint} permValue - Value of permission to apply / take back 
 * @param {bool} value - Apply or take back permission
 */
function createPermTx(pAddr, privKey, dAddr, permValue, value) {
    const type = 0x20;
    var chainId;
    var sequence;
    return new Promise((resolve, reject) => {
        return getChainID()
            .then(id => {
                chainId = id;
                return getSequence(pAddr);
            }).then(seq => {
                sequence = seq;
                var input = {
                    address: pAddr,
                    amount: 1,
                    sequence: sequence + 1
                }
                var args = [
                    2,
                    { address: dAddr, permission: permValue, value: value }
                ]
                var signBytes = writeSignBytes(chainId, type, args, input)
                var signature = signTx(signBytes, privKey);
                var tx = assembleTx(type, input, args, signature);
                resolve(tx);
            }).catch(error => {
                reject(error);
            })
    })
}

/**
 * Set permission for the user
 * @param {*} pAddr - Address of the user setting the permission
 * @param {*} privKey - Private key used to sign
 * @param {String} dAddr - Adress of the permission receiver 
 * @param {Uint} permValue - Value of permission to apply / take back 
 * @param {bool} value - Apply or take back permission
 * @param {function} callback - return true if action went well
 */
function setUserPerm(pAddr, privKey, dAddr, permValue, value, callback) {
    createPermTx(pAddr, privKey, dAddr, permValue, value)
        .then(tx => {
            let transactions = edb.txs();
            transactions.broadcastTx(tx, callback)
        })
}

module.exports = {
    setUserPerm: setUserPerm,
    PermValue: PermValue
}