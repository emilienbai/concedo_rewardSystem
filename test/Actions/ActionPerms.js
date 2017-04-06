var assert = require('assert');
var common = require('../common');

describe('Test set action perm', function () {
    this.timeout(25000);

    before(function () {
        //Add action set action perm
        return common.managers.full.actionManager.addAction("setactionpermission", "deployActionSetActionPerm")
            .then(() => {
                //Add action set user permission -> action we will set perm for
                return common.managers.full.actionManager.addAction("setuserpermission", "deployActionSetUsermPerm");
            })
    })

    describe('Test set action permission', function () {
        it('Should set action permission', function () {
            return common.managers.full.permManager.setActionPermission("setuserpermission", common.permLevels.FULL)
                .then(() => {
                    return common.managers.full.actionManager.getActionPerm("setuserpermission")
                    .then((perm)=>{
                        assert.equal(perm, common.permLevels.FULL);
                    })
                })
        })
    })

    after(function () {
        return common.managers.full.permManager.setActionPermission("setuserpermission", common.permLevels.ALL)
            .then(() => {
                return common.managers.full.actionManager.addAction("removeaction", "deployActionRemoveAction")
            })
            .then((result) => {
                return common.managers.full.actionManager.removeAction("setactionpermission")
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("setuserpermission");
            })
            .then(() => {
                return common.managers.full.actionManager.removeAction("removeaction");
            })
    })
})