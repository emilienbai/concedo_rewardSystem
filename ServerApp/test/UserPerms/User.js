var assert = require('assert');
var common = require('../common');

describe('Test add and remove user', function () {
    this.timeout(25000);
    before(function () {
        return common.managers.full.actionManager.addAction("adduser", "deployActionAddUser")
            .then((result) => {
                return common.managers.full.actionManager.addAction("removeuser", "deployActionRemoveUser");
            })
            .then((result) => {
                return common.managers.full.actionManager.addAction("clear", "deployActionClearDb");
            })
            .then((result) => {
                return common.managers.full.actionManager.clear();
            })
    })

    describe('Test add user', function () {
        it('should add a user', function () {
            return common.managers.full.userManager.addUser(common.address.full.address, "Full", common.users.full)
                .then(() => {
                    return common.managers.full.userManager.getUsers()
                        .then((list) => {
                            assert.equal(list.length, 1);
                        })
                })
        })
    })

    describe('Test remove User', function () {
        it('Should remove the user', function () {
            return common.managers.full.userManager.removeUser(common.address.full.address)
                .then(() => {
                    return common.managers.full.userManager.getUsers()
                        .then((list) => {
                            assert.equal(list.length, 0);
                        })
                })
        })
    })

    after(function () {
        return common.managers.full.actionManager.clear()
            .then((result) => {
                return common.managers.full.actionManager.addAction("removeaction", "deployActionRemoveAction")
            })
            .then((result) => {
                return common.managers.full.actionManager.removeAction("adduser")
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeuser");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("clear");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})