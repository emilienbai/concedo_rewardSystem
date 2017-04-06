var assert = require('assert');
var common = require('../common');

describe('Test set user perm', function () {
    this.timeout(25000);

    before(function () {
        //Add action add user
        return common.managers.full.actionManager.addAction("adduser", "deployActionAddUser")
            .then(() => {
                //Add action remove user
                return common.managers.full.actionManager.addAction("removeuser", "deployActionRemoveUser");
            })
            .then(() => {
                //Add action set user permission
                return common.managers.full.actionManager.addAction("setuserpermission", "deployActionSetUsermPerm");
            })
            .then((result) => {
                return common.managers.full.actionManager.addAction("clear", "deployActionClearDb");
            })
            .then((result) => {
                return common.managers.full.actionManager.clear();
            })
            .then(() => {
                //Add user full
                return common.managers.full.userManager.addUser(common.address.full.address, "Full", common.users.full.encrypt())
            })
    })

    describe('Test set permission', function () {
        it('Should set user permission', function () {
            return common.managers.full.permManager.setUserPermission(common.address.full.address, common.permLevels.FULL)
                .then(() => {
                    return common.managers.full.userManager.getUsers()
                        .then((list) => {
                            assert.equal(list[0].perm, common.permLevels.FULL);
                        })
                })
        })
    })

    after(function () {
        return common.managers.full.userManager.removeUser(common.address.full.address)
            .then(() => {
                return common.managers.full.actionManager.addAction("removeaction", "deployActionRemoveAction")
            })
            .then((result) => {
                return common.managers.full.actionManager.clear();
            })
            .then((result) => {
                return common.managers.full.actionManager.removeAction("clear")
            })
            .then((result) => {
                return common.managers.full.actionManager.removeAction("adduser")
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeuser");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("setuserpermission");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})

