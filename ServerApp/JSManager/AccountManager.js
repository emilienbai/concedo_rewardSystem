var edbFactory = require('@monax/legacy-db');
var crypto = require('crypto');
var ed25519 = require('ed25519');
var config = require('../config');

var edb = edbFactory.createInstance(config.erisdbURL);

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

function checkKeyPair(keyPair) {
    try {
        let testMessage = "this is a test message to sign";
        let sig = ed25519.Sign(new Buffer(testMessage, 'utf8'), new Buffer(keyPair.privKey, "hex"));
        let pub = new Buffer(keyPair.pubKey, "hex");
        let verif = ed25519.Verify(new Buffer(testMessage, 'utf8'), sig, pub)

        if (verif) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
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
 * Create full credentials compatible with eris-blockchain
 */
function createCredential() {
    let credentials = generateKeyPair();
    credentials.address = addressFromKeyPair(credentials);
    return credentials;
}


/**
 * Add an account to the chain by sending 1 token to its address (and taking it back)
 */
function addAccount() {
    var credentials = createCredential();
    let transaction = edb.txs();
    return new Promise((resolve, reject) => {
        transaction.sendAndHold(config.account.privKey, credentials.address, 1, null, (error, result) => {
            if (error) {
                console.error("Aller");
                console.error(error);
                reject(error);
            }
            /*transaction.sendAndHold(credentials.privKey, config.account.address, 1, null, (error, result) => {
                if (error) {
                    console.error("Retour");
                    console.error(error);
                    reject(error);
                }
                resolve(credentials);
            })
            TODO Solve the return funds problems
            */
            resolve(credentials);
        })
    })
}


module.exports = {
    addAccount: addAccount,
    addressFromKeyPair: addressFromKeyPair,
    checkKeyPair: checkKeyPair
}