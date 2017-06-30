var edbFactory = require('@monax/legacy-db');
var crypto = require('crypto');
var ed25519 = require('ed25519');
var config = require('./config');
var canonicalJson = require('canonical-json');
var ramda = require('ramda');
var request = require('request-promise');


var edb = edbFactory.createInstance(config.erisdbURL);
let accounts = edb.accounts();
let blockchain = edb.blockchain();
let transactions = edb.txs();


function writeSignBytes(chainId, type, args, input) {
    return '{"chain_id":' + canonicalJson(chainId) + ',"tx":[' +
        canonicalJson(type) + ',{"args":"' + canonicalJson(args) + '","input":' +
        canonicalJson(input) + '}]}'
}

function stringToArrayBuffer(str) {
    var utf8 = unescape(encodeURIComponent(str));
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = utf8.charCodeAt(i);
    }
    return bufView;
}

function signTx(bytestoSign, privKey) {
    var signature = ed25519.Sign(new Buffer(bytestoSign, 'utf8'), new Buffer(privKey, "hex"))
    return signature.toString('hex');
}

function assembleTx(type, input, args, signature) {
    sig = [1, signature.toString('hex')];
    return [type, {
        input: ramda.assoc('signature', sig, input),
        args: args
    }]
}

function getChainID() {
    return new Promise((resolve, reject) => {
        blockchain.getInfo((error, chainID) => {
            if (error) reject(error);
            else resolve(chainID.chain_id)
        })
    })
}

function getSequence(address) {
    return new Promise((resolve, reject) => {
        accounts.getAccount(address, (error, value) => {
            if (error) reject(error);
            else resolve(value.sequence);
        })
    })
}

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
 * Create a permission transaction on the chain
 * @param {String} address - Adress of the premission receiver 
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
 * @param {String} address - Adress of the premission receiver 
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

setUserPerm("BC356BA4C8A19E7C39D24859951B13A46D8F62BE",
    "2A7FF5EB54CD54A8B3C2B02404FE02DD94677F6A4116FC4BC38EFD30712B23ACDB403E296DE0D5312E51FE74B682220B9E52249A9E7628C1102FF222B3E22698",
    "AE8FD98A9DE8AD7319347DD080EFA68FBE994736", 256, false, (err,res) => { console.error(err);console.log(res) });


