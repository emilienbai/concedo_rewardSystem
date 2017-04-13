var assert = require('assert');
var common = require('../common');

describe('Test Add Rewards with perms', function () {
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


    describe('Rewarder adds Reward', function () {
        it('Should actually add the reward', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 1);
                })
        })
    })

    describe('Volunteer adds Reward', function () {
        it('Should not actually add the reward', function () {
            return common.managers.full.userManager.addUser(common.address.volunteer.address, "Volunteer", common.users.volunteer)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.volunteer.address, common.permLevels.VOLUNTEER);
                })
                .then((res) => {
                    return common.managers.volunteer.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.volunteer.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 0);
                })
        })
    })

    describe('Elderly adds Reward', function () {
        it('Should not actually add the reward', function () {
            return common.managers.full.userManager.addUser(common.address.elderly.address, "Volunteer", common.users.elderly)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.elderly.address, common.permLevels.ELDERLY);
                })
                .then((res) => {
                    return common.managers.elderly.rewardManager.addReward(common.rewards.aaaReward)
                })
                .then((res) => {
                    return common.managers.elderly.rewardManager.getRewards()
                })
                .then((rewardList) => {
                    assert.equal(rewardList.length, 0);
                })
        })
    })

    describe('Rewarder adds twice the same reward', function () {
        it('Should add the reward only once', function () {
            return common.managers.full.userManager.addUser(common.address.rewarder.address, "Rewarder", common.users.rewarder)
                .then((res) => {
                    return common.managers.full.permManager.setUserPermission(common.address.rewarder.address, common.permLevels.REWARDER);
                })
                .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward);
                })
                 .then((res) => {
                    return common.managers.rewarder.rewardManager.addReward(common.rewards.aaaReward);
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

