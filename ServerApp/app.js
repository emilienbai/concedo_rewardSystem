// requires
var ActionManager = require('./JSManager/ActionManager');
var UserManager = require('./JSManager/UserManager');
var PermissionManager = require('./JSManager/PermissionManager');
var burrowC = require('@monax/legacy-contracts');
var utils = require('./JSManager/Utils');
var config = require('./config');


// NOTE. On Windows/OSX do not use localhost. find the
// url of your chain with:
// docker-machine lsnode 
// and find the docker machine name you are using (usually default or eris).
// for example, if the URL returned by docker-machine is tcp://192.168.99.100:2376
// then your erisdbURL should be http://192.168.99.100:1337/rpc
var erisdbURL = "http://localhost:1337/rpc";

// properly instantiate the contract objects manager(userAddress) using the )erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('../../../chains/concedo_chain/accounts.json');
var contractsManagerFull = burrowC.newContractManagerDev(erisdbURL, accountData.concedo_chain_full_000);

var full = accountData.concedo_chain_full_000;
var partVolunteer = accountData.concedo_chain_participant_000;
var partElderly = accountData.concedo_chain_participant_001;
var partRewarder = accountData.concedo_chain_participant_002;

//Actions
var actionManager = new ActionManager.ActionManager(contractsManagerFull);
var userManager = new UserManager.UserManager(contractsManagerFull);

var permManagerFull = new PermissionManager.PermisssionManager(contractsManagerFull);

var perms = PermissionManager.perms;

function AddActionAndSetPermission() {
    actionManager.addAllAction(true)
        .then(() => {
            var userFull = new UserManager.User("Mouse", "Mickey", "DisneyCity", "20/10/1994", "0333334455", "mickey@mouse.com", "full");
            return userManager.addUser(full.address, "Full", userFull);
        })
        .then((result) => {
            console.log("Add user Mickey Mouse -> " + result);
            return permManagerFull.setUserPermission(full.address, perms.FULL);
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
//AddActionAndSetPermission(true);

//*********************************Users***************************************/

function addUsersAndSetPerms() {
    var userVolunteer = new UserManager.User("Doe", "John Volunteer", "Luleå", "0123456789", "john@doe.se", "volunteer");
    var userElderly = new UserManager.User("Mamene", "Lorenzo Elderly", "Luleå", "0312456789", "lorenzo@mamene.sal", "elderly");
    var userRewarder = new UserManager.User("Potter", "Harry Rewarder", "Luleå", "0312456789", "harry@potter.fr", "rewarder");

    userManager.addUser(partVolunteer.address, "volunteer", userVolunteer)
        .then((result) => {
            console.log("Add user John Doe -> " + result);
            return userManager.addUser(partElderly.address, "elderly", userElderly);
        })
        .then((result) => {
            console.log("Add user Lorenzo Mamene -> " + result);
            return userManager.addUser(partRewarder.address, "rewarder", userRewarder);
        })
        .then((result) => {
            console.log("Add user Harry Potter -> " + result);
            return permManagerFull.setUserPermission(partVolunteer.address, perms.VOLUNTEER);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.VOLUNTEER + " : " + partVolunteer.address + " -> " + result);
            return permManagerFull.setUserPermission(partElderly.address, perms.ELDERLY);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.ELDERLY + " : " + partElderly.address + " -> " + result);
            return permManagerFull.setUserPermission(partRewarder.address, perms.REWARDER);
        })
        .then((result) => {
            console.log("Set user perm : " + perms.REWARDER + " : " + partRewarder.address + " -> " + result);
            console.log("Actions deployed and permissions set !");
        }).catch(console.error);
}

//addUsersAndSetPerms();

/*
actionManager.addAction('clear', 'deployActionClearDb')
    .then(result => {
        console.log(result);
        actionManager.clear().then((result) => {
            console.log(result);
        })
    })
*/

/*
actionManager.clear().then((result)=>{
    console.log(result);
})
*/