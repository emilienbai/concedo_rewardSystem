var assert = require('assert');
var common = require('../common');

describe('Test commit to Offer', function () {
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
                return common.managers.full.actionManager.addAction("committooffer", "deployActionCommitToOffer");
            })
            .then(() => {
                return common.managers.full.permManager.setActionPermission("committooffer", common.permLevels.VOLUNTEER)
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



    describe('Volunteer commits to an Offer', function () {
        it('Should accept the volunteer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly)
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer)
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList[0].volunteer, common.address.volunteer.address);
                })
        })
    })

    describe('Volunteer commits to a non available Offer', function () {
        it('Should accept the volunteer', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly)
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer)
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER)
                })
                .then(() => {
                    return common.managers.full.userManager.addUser(common.address.rewarder.address, "Volunteer2", common.users.rewarder)
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.VOLUNTEER)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.rewarder.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList[0].volunteer, common.address.volunteer.address);
                })
        })
    })

    describe('Elderly commits to an Offer', function () {
        it('Should not accept the commit action', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly)
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer)
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.ELDERLY)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList[0].volunteer, "0000000000000000000000000000000000000000");
                })
        })
    })

    describe('Rewarder commits to an Offer', function () {
        it('Should not accept the commit action', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Elderly", common.users.elderly)
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then(() => {
                    return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder)
                })
                .then(() => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER)
                })
                .then(() => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer)
                })
                .then(() => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId())
                })
                .then(() => {
                    return common.managers.elderly.offerManager.getOffers()
                })
                .then((offerList) => {
                    assert.equal(offerList[0].volunteer, "0000000000000000000000000000000000000000");
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
                return common.managers.full.actionManager.removeAction("committooffer");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})

