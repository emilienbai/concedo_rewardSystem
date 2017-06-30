
'use strict'
const edbFactory = require('@monax/legacy-db');
const crypto = require('crypto');
const ed25519 = require('ed25519');
const canonicalJson = require('canonical-json');
const ramda = require('ramda');

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
    CreateContract: 0x08,
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
 * Here you instanciate the connexion with your chain
 */
const edb = edbFactory.createInstance("http://localhost:1337/rpc");
const accounts = edb.accounts();
const blockchain = edb.blockchain();
const transactions = edb.txs();

/**
 * Generate a random key pair for public key signature
 */
function generateKeyPair() {
    let seed = crypto.randomBytes(32);
    let keyPair = ed25519.MakeKeypair(seed);

    return {
        pubKey: keyPair.publicKey.toString('hex').toUpperCase(),
        privKey: keyPair.privateKey.toString('hex').toUpperCase()
    };
}

/**
 * Create an address from a public kay, compatible with Eris blockchaine
 * @param {Object} keyPair - Public and private key created with ed25519
 * @return {String} addr - an address compatible with eris blockchain
 */
function addressFromKeyPair(keyPair) {
    const hash = crypto.createHash("ripemd160");

    var preBuff = Buffer([0x01, 0x01, 0x20]);
    var pubKeyBuff = Buffer(keyPair.pubKey, 'hex');
    var buf = Buffer.concat([preBuff, pubKeyBuff]);

    hash.update(buf);
    let addr = hash.digest('hex');
    return addr.toUpperCase();
}

/**
 * Create full credentials compatible with burrow-blockchain
 */
function createCredential() {
    let credentials = generateKeyPair();
    credentials.address = addressFromKeyPair(credentials);
    return credentials;
}

/**
 * Concatenate bytes to sign in transaction
 * @param {String} chainId - ID of the chain
 * @param {number} type - Type of transaction
 * @param {Object} args - Data args for the transaction
 * @param {Object} input - Input params of the transaction
 */
function writeSignBytes(chainId, type, args, input) {
    return '{"chain_id":' + canonicalJson(chainId) + ',"tx":[' +
        canonicalJson(type) + ',{"args":"' + canonicalJson(args) + '","input":' +
        canonicalJson(input) + '}]}'
}

/**
 * Convert a string to Uint8Array object
 * @param {String} str 
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
 * Sign the transaction
 * @param {*} bytestoSign - Data to sign
 * @param {*} privKey - Key to use for signing
 */
function signTx(bytestoSign, privKey) {
    var signature = ed25519.Sign(new Buffer(bytestoSign, 'utf8'), new Buffer(privKey, "hex"))
    return signature.toString('hex');
}

/**
 * Assemble every element to form a valid transaction
 * @param {number} type - type of transaction
 * @param {*} input - input value of transaction
 * @param {*} args - Arguments for transaction
 * @param {*} signature - Signature of the transaction
 */
function assembleTx(type, input, args, signature) {
    var sig = [1, signature.toString('hex')];
    return [type, {
        input: ramda.assoc('signature', sig, input),
        args: args
    }]
}

/**
 * Retrieve chain ID
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
 * Retrieve sequence value for a given address
 * @param {String} address 
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
 * Create a permission transaction on the chain
 * @param {String} address - Adress of the premission receiver 
 * @param {Uint} permValue - Value of permission to apply / take back 
 * @param {bool} value - Apply or take back permission
 */
function createPermTx(pAddr, privKey, dAddr, permValue, value) {
    const type = TxType.Perm;
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

/**
 * Add a new account for the chain - Credentials of the new account are created from a random seed
 * @param {String} rootAddress - Address of the account used to create the new one
 * @param {String} privKey - Private key of the account used to add the new one
 * The creator must be allowed to create accounts (>0)
 * @param {int} amount - Ammount of tokens to send to the newly created account
 * @param {int} permValue - Permission value to grant to the user
 */
function addAccount(rootAddress, privKey, amount, permValue) {
    var credentials = createCredential();
    console.log("newAccount credentials :", credentials);
    return new Promise((resolve, reject) => {
        transactions.sendAndHold(privKey, credentials.address, amount, null, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                setUserPerm(rootAddress, privKey,
                    credentials.address, PermValue.Call, true, (error, result) => {
                        if(error) reject(error);
                        else resolve (true)
                    })
            }
        })
    })
}

let rootAddress = "BC356BA4C8A19E7C39D24859951B13A46D8F62BE";
let privKey = "2A7FF5EB54CD54A8B3C2B02404FE02DD94677F6A4116FC4BC38EFD30712B23ACDB403E296DE0D5312E51FE74B682220B9E52249A9E7628C1102FF222B3E22698"
let amount = 42
let permission = PermValue.Call + PermValue.Send;

addAccount(rootAddress, privKey, amount, permission);