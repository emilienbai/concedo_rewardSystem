var assert = require('assert');
var common = require('../common');

describe('Test Remove Offer with perms', function () {
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
            .then(() => {
                return common.managers.full.actionManager.addAction("removeoffer", "deployActionRemoveOffer");
            })
            .then(() => {
                return common.managers.full.permManager.setActionPermission("removeoffer", common.permLevels.ELDERLY)
            })
            .then(() => {
                return common.managers.full.actionManager.addAction("committooffer", "deployActionCommitToOffer");
            })
    })

    beforeEach(function () {
        return common.managers.full.actionManager.clear();
    })



    describe('Elderly remove his own Offer', function () {
        it('Should remove the offer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.removeOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 0);
                })
        })
    })

    describe('Elderly remove someone else Offer', function () {
        it('Should not remove the offer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    common.managers.full.userManager.addUser(common.address.volunteer.address, "Elderly2", common.users.volunteer.encrypt())
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.removeOffer(common.offers.aaaOffer.findId())
                })
                .then((res) => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 1);
                })
        })
    })


    describe('Elderly remove his own Offer which someone committed', function () {
        it('Should not remove the offer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly.encrypt())
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer.encrypt())
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.removeOffer(common.offers.aaaOffer.findId())
                })
                .then((res) => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList.length, 1);
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
                return common.managers.full.actionManager.removeAction("removeoffer");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("committoOffer");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})

