var assert = require('assert');
var common = require('../common');

describe('Test remove Rewards with perms', function () {
    this.timeout(60000);

    before(function () {
        return common.managers.full.actionManager.addAllAction()
            .then(() => {
                return common.managers.full.userManager.addUser(common.address.full.address, "Full user", "{}");
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


    describe('Rewarder remove its own Reward', function () {
        it('Should actually remove the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder.encrypt())
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.removeReward(common.rewards.aaaReward.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 0);
                })
        })
    })

    describe('Rewarder remove someone else Reward', function () {
        it('Should not remove the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder.encrypt())
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "Rewarder2", common.users.volunteer.encrypt());
                })
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.volunteer.rewardManager.removeReward(common.rewards.aaaReward.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 1);
                })
        })
    })

    describe('Rewarder remove a bought reward', function () {
        it('Should not remove the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder.encrypt())
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.volunteer.address, "volunteer", common.users.volunteer.encrypt());
                })
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })
                .then((res) => {
                    return common.managers.full.userManager.addUser(common.address.elderly.address, "elderly", common.users.elderly.encrypt());
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
                    return common.managers.rewarder.rewardManager.removeReward(common.rewards.aaaReward.findId());
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 1);
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

