var assert = require('assert');
var common = require('../common');

describe('Test Add Offer with perms', function () {
    this.timeout(25000);



    before(function () {
        return common.managers.full.actionManager.addAction("adduser", "deployActionAddUser")
            .then(() => {
                //Add action remove user
                return common.managers.full.actionManager.addAction("removeuser", "deployActionRemoveUser");
            })
            .then(() => {
                //Add action set user permission
                return common.managers.full.actionManager.addAction("setuserpermission", "deployActionSetUsermPerm");
            })
            .then(() => {
                return common.managers.full.actionManager.addAction("setactionpermission", "deployActionSetActionPerm");
            })
            .then(() => {
                return common.managers.full.actionManager.addAction("clear", "deployActionClearDb");
            })
            .then(() => {
                return common.managers.full.actionManager.addAction("addoffer", "deployActionAddOffer");
            })
            .then(() => {
                return common.managers.full.permManager.setActionPermission("addoffer", common.permLevels.ELDERLY)
            })
    })

    afterEach(function () {
        return common.managers.full.actionManager.clear()
            .then(() => {
                return common.managers.full.userManager.removeUser(common.address.elderly.address);
            })
            .then(() => {
                return common.managers.full.userManager.removeUser(common.address.volunteer.address);
            })
            .then(() => {
                return common.managers.full.userManager.removeUser(common.address.rewarder.address);
            })
    })



    describe('Elderly adds Offer', function () {
        it('Should actually add the offer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 1);
                })
        })
    })

    describe('Volunteer adds Offer', function () {
        it('Should not add any offer', function () {
            return common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.addOffer(common.offers.bbbOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 0);
                })
        })
    })

    describe('Rewarder adds Offer', function () {
        it('Should not add any offer', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then(() => {
                    return common.managers.rewarder.offerManager.addOffer(common.offers.cccOffer)
                })
                .then(() => {
                    return common.managers.rewarder.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 0);
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
                return common.managers.full.actionManager.removeAction("setactionpermission");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("addoffer");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})

