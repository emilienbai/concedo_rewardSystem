var assert = require('assert');
var common = require('../common');

describe('Test buy Rewards with perms', function () {
    this.timeout(60000);

    before(function () {
        return common.managers.full.actionManager.addAllAction()
            .then(() => {
                return common.managers.full.userManager.addUser(common.address.full.address, "Full user", common.users.full);
            })
            .then(() => {
                return common.managers.full.permManager.setUserPermission(common.address.full.address, common.permLevels.FULL);
            })
            .then(() => {
                return common.managers.full.actionManager.addAction("clear", "deployActionClearDb");
            })
            .then(() => {
                return common.managers.full.permManager.setAllActionPerm();
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


    describe('Volunteer with enough tokens buys a Reward', function () {
        it('Should actually buy the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "volunteer", common.users.volunteer);
                })
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.elderly.address, "elderly", common.users.elderly);
                })
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then((res) => {
                    return common.managers.elderly.offerManager.addOffer(common.offers.aaaOffer);
                })
                .then((res) => {
                    return common.managers.volunteer.offerManager.commitToOffer(common.offers.aaaOffer.findId());
                })
                .then((res) => {
                    return common.managers.volunteer.offerManager.claimOffer(common.offers.aaaOffer.findId());
                })
                .then((res) => {
                    return common.managers.elderly.offerManager.confirmOffer(common.offers.aaaOffer.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.volunteer.rewardManager.buyReward(common.rewards.aaaReward.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList[0].buyer, common.address.volunteer.address);
                })
        })
    })

    describe('Volunteer with not enough tokens buys a Reward', function () {
        it('Should not buy the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "volunteer", common.users.volunteer);
                })
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })                
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.volunteer.rewardManager.buyReward(common.rewards.aaaReward.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList[0].buyer, '0000000000000000000000000000000000000000');
                })
        })
    })

    after(function () {
        return common.managers.full.permManager.resetPermissions()
            .then((result) => {
                return common.managers.full.actionManager.clear();
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction('clear');
            })
            .then(() => {
                return common.managers.full.userManager.removeUser(common.address.full.address)
            })
            .then((result) => {
                return common.managers.full.actionManager.removeAllAction();
            })
    })
})

