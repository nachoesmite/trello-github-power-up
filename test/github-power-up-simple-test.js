var wt = require("../webtasks/github-power-up-simple.js");
var chai = require('chai');
chai.should();
var object2Test = {"assert":"true"};

describe('Finishes on Master', function() {
  describe('Has commit to process', function() {
    it('should move trello card when starts with #finishes {cardId}', function() {
      object2Test.should.have.property('assert');
    });
    it('should move trello card when has #finishes {cardId} in the middle', function() {
      object2Test.should.have.property('assert');
    });
  });
  describe('Has not commit to process', function() {
    it('shouldn\'t move anything to trello b/c no cardId', function() {
      object2Test.should.have.property('assert');
    });

    it('shouldn\'t move anything to trello b/c no message with finishes at all', function() {
      object2Test.should.have.property('assert');
    })

    it('shouldn\'t move anything to trello b/c no master branch', function() {
      object2Test.should.have.property('assert');
    });
  });
});

describe('Accepts on Master', function() {
  describe('Has commit to process', function() {
    it('should move trello card when starts with #accepts {cardId}', function() {
      object2Test.should.have.property('assert');
    });
    it('should move trello card when has #accepts {cardId} in the middle', function() {
      object2Test.should.have.property('assert');
    });
  });
  describe('Has not commit to process', function() {
    it('shouldn\'t move anything to trello b/c no cardId', function() {
      object2Test.should.have.property('assert');
    });

    it('shouldn\'t move anything to trello b/c no message with accepts at all', function() {
      object2Test.should.have.property('assert');
    })

    it('shouldn\'t move anything to trello b/c no master branch', function() {
      object2Test.should.have.property('assert');
    });
  });
});

describe('Trigger Pull Request', function() {
  describe('Has commit to process', function() {
    it('should move trello card and add comment of pull request when starts with #accepts {cardId}', function() {
      object2Test.should.have.property('assert');
    });
    it('should move trello card and add comment of pull request when has #accepts {cardId} in the middle', function() {
      object2Test.should.have.property('assert');
    });
    it('should move trello card and add comment of pull request when starts with #finishes {cardId}', function() {
      object2Test.should.have.property('assert');
    });
    it('should move trello card and add comment of pull request when has #finishes {cardId} in the middle', function() {
      object2Test.should.have.property('assert');
    });
  });
  describe('Has not commit to process', function() {
    it('shouldn\'t move anything to trello b/c no cardId', function() {
      object2Test.should.have.property('assert');
    });
    it('shouldn\'t move anything to trello b/c no message with accepts or finishes at all', function() {
      object2Test.should.have.property('assert');
    })
  });
});
