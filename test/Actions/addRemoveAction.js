var assert = require('assert');

var common = require('../common');

describe('Test add and remove actions', function () {
  describe('Test add actions', function () {
    this.timeout(25000);
    it('should add every action', function () {
      return common.managers.full.actionManager.addAllAction()
        .then((result) => {
          assert.ok(result);
        })
        .catch(console.error)
    });
  })

  describe('Test remove actions', function(){
    this.timeout(25000);
    it("should remove every action", function(){
      return common.managers.full.actionManager.removeAllAction()
      .then((result)=>{
        assert.ok(result);
      })
      .catch(console.error);
    })
  })
});

