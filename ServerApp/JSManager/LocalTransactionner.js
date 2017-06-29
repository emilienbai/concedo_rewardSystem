var ed25519 = require('ed25519');
var config = require('../config');
var canonicalJson = require('canonical-json');
var ramda = require('ramda');
var request = require('request-promise');

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
    CreateAccount: 0x08,
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

/**
 * Do a JSON RPC request on the chain
 * @param {Object} data  request data (at least 'method' and 'jsonrpc' version)
 */
function postRPC(data) {
    const options = {
        method: 'POST',
        uri: config.erisdbURL,
        body: data,
        json: true
    };

    return new Promise((resolve, reject) => {
        return request(options)
            .then((parsedBody) => {
                if (parsedBody.result)
                    resolve(parsedBody.result);
                else
                    throw (parsedBody.error)
            }).catch(error => {
                reject(error);
            })
    })
}

/**
 * Get the ID of the blockchain
 */
function getChainID() {
    let data = {
        "jsonrpc": "2.0",
        "method": "burrow.getChainId"
    }
    return new Promise((resolve, reject) => {
        return postRPC(data)
            .then(result => {
                resolve(result.chain_id);
            }).catch(error => {
                reject(error)
            })
    })
}

/**
 * Get sequence value for a given address
 * Usefull for signing transactions 
 * @param {String} address - Adress of the account which will send the transaction
 */
function getSequence(address) {
    let data = {
        "jsonrpc": "2.0",
        "method": "burrow.getAccount",
        "params": { "address": address }
    }
    return new Promise((resolve, reject) => {
        return postRPC(data)
            .then(result => {
                resolve(parseInt(result.sequence, 10))
            }).catch(error => {
                reject(error)
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
 * @param {String} address - Adress of the premission receiver 
 * @param {Uint} permValue - Value of permission to apply / take back 
 * @param {bool} value - Apply or take back permission
 */
function createPermTx(address, permValue, value) {

    const type = TxType.Perm;
    var chainId;
    var sequence;
    return new Promise((resolve, reject) => {
        return getChainID()
            .then(id => {
                chainId = id;
                return getSequence(config.account.address);
            }).then(seq => {
                sequence = seq;
                var input = {
                    address: config.account.address,
                    amount: 1,
                    sequence: sequence + 1
                }
                var args = [
                    2,
                    { address: address, permission: permValue, value: value }
                ]
                var signBytes = writeSignBytes(chainId, type, args, input)
                var signature = signTx(signBytes, config.account.privKey);
                var tx = assembleTx(type, input, args, signature);
                resolve(tx);
            }).catch(error => {
                reject(error);
            })
    })
}

/**
 * Set permission for the user
 * @param {String} address - Adress of the premission receiver 
 * @param {Uint} permValue - Value of permission to apply / take back 
 * @param {bool} value - Apply or take back permission
 * @param {*} callback - return true if action went well
 */
function setUserPerm(address, permValue, value, callback) {
    createPermTx(address, permValue, value)
        .then(tx => {
            const data = {
                "jsonrpc": "2.0",
                "method": "burrow.broadcastTx",
                "params": tx
            };
            return postRPC(data)
                .then(result => {
                    console.log(result);
                    callback(true);
                })
        }).catch(error => {
            console.error("Error while setting user permission", error);
            callback(false);
        })
}

module.exports = {
    setUserPerm: setUserPerm, 
    PermValue: PermValue
}