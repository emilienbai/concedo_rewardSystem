// requires
var ActionManager = require('./JSManager/ActionManager');
var UserManager = require('./JSManager/UserManager');
var PermissionManager = require('./JSManager/PermissionManager');
var burrowC = require('@monax/legacy-contracts');
var config = require('./config');

var erisdbURL = config.erisdbURL

// properly instantiate the contract objects manager(userAddress) using the )erisdb URL
// and the account data (which is a temporary hack)
var contractsManagerFull = burrowC.newContractManagerDev(erisdbURL, config.account);

//Actions
var actionManager = new ActionManager.ActionManager(contractsManagerFull);
var userManager = new UserManager.UserManager(contractsManagerFull);

var permManagerFull = new PermissionManager.PermisssionManager(contractsManagerFull);

var perms = PermissionManager.perms;

function AddActionAndSetPermission() {
    actionManager.addAllAction(true)
        .then(() => {
            var userFull = new UserManager.User("FullUSer", "FullUser", "FullLocation", "01/01/1970", "0123456789", "full@concedo.org", "full");
            return userManager.addUser(config.account.address, "Full", userFull);
        })
        .then((result) => {
            console.log("Add user Full -> " + result);
            return permManagerFull.setUserPermission(config.account.address, perms.FULL);
        })
        .then((result) => {
            console.log("Set full perm -> " + result);
            if (result)
                return permManagerFull.setAllActionPerm(true);
            else throw ("permission not set");
        })
        .then(() => {
            console.log("Actions deployed and permissions set !");
        }).catch(console.error);
}
AddActionAndSetPermission(true);
