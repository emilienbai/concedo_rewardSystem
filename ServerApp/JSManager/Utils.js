/**
 * Convert hexadecimal to readable string
 * @param {String} hex - String to convert
 */
function hexToString(hex){
        if(hex == 0) 
            return "";
        var str = "";
        var i = 0, l = hex.length;
        if (hex.substring(0, 2) === '0x') {
            i = 2;
        }
        for (; i < l; i+=2) {
            var code = parseInt(hex.substr(i, 2), 16);
            if(code != 0)
                str += String.fromCharCode(code);
        }
        return str;
    }
 /**
  * 
  * @param {Object} headers - Header of a Http request 
  */
function credentialFromHeaders(headers) {
    if (!headers.address || !headers.pubkey || !headers.privkey) {
        throw ({ error: "missing params in header" });
        return null
    }
    return {
        "address": headers.address,
        "pubKey": headers.pubkey,
        "privKey": headers.privkey
    }
}

module.exports = {
    hexToString:  hexToString,
    credentialFromHeaders: credentialFromHeaders
};
