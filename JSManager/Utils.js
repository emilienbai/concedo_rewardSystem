module.exports = {
    hexToString: function(hex){
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
};
