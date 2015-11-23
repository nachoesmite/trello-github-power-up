
var chai = require('chai');
chai.should();
var data;
var wt;
var mock = require('mock-require');

var accepted = {"listId": "565089d40f6103ddb430baed", "processed": true}
var finished = {"listId": "565089d21d02cd33b5e31164", "processed": true}
var pullListId = "5650efcf30344c50260e27b7";


describe('PowerUp Webtask Test', function() {
  afterEach(function () {
    delete require.cache[__dirname + '/github-power-up-simple.js'];
    mock.stopAll();
  });
  //to know if mocked request is invoked at least once or not

  describe('Finishes or Accepts on Master', function() {
    before(function(){
      mock('request', function (options, func) {
        options.should.have.property("method","PUT");
        options.uri.should.be.a("string");
        options.qs.value.should.be.a('string');
        func();
      });
      wt = require(__dirname + '/github-power-up-simple.js');
    })
    describe('Has 1 commit total and 1 commit to process that finishes or accepts a card', function() {
      it('starts with #finishes {cardId}', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "#finishes {cardId1}"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([finished]);
        });
      });
      it('#finishes {cardId} in the middle', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #finishes {cardId1} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([finished]);
        });
      });
      it('starts with #accepts {cardId}', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "#accepts {cardId1}"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([accepted]);
        });
      });
      it('#accepts {cardId} in the middle', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #accepts {cardId1} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
            body.should.have.property("results").to.deep.equal([accepted]);
        });
      });
    });

    describe('Has 2 commits', function() {
      it('2 accepts', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #accepts {cardId1} and some text after"
          }, {
            message: "#accepts {cardId2} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([accepted,accepted]);
        });
      });
      it('2 finishes', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #finishes {cardId1} and some text after"
          }, {
            message: "#finishes {cardId2} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([finished,finished]);
        });
      });
      it('1 finish & 1 accept', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #finishes {cardId1} and some text after"
          }, {
            message: "#accepts {cardId2} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([finished,accepted]);
        });
      });
      it('1 accepts & 1 finish(should not take care)', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #accepts {cardId1} and some text after"
          }, {
            message: "#finish {cardId2} and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([accepted,{processed: false}]);
        });
      });
    });
    describe('Has not commit to process', function() {
      it('shouldn\'t move anything to trello b/c no cardId', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "some text before ... #accepts {cardId1 and some text after"
          }, {
            message: "#finishes  and some text after"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([{processed: false},
            {processed: false}]);
        });
      });

      it('shouldn\'t move anything to trello b/c no message with finishes or accepts at all', function() {
        data = {
          ref: 'refs/heads/master',
          commits: [{
            message: "not related text"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "Push Processed");
          body.should.have.property("results").to.deep.equal([{processed: false}]);
        });
      })

      it('shouldn\'t move anything to trello b/c no master branch', function() {
        data = {
          ref: 'refs/hea/master',
          commits: [{
            message: "not related text"
          }]
        };
        wt({data:data}, function(error, body){
          body.should.have.property("message", "No action required");
        });
      });
    });
  });

  describe('Trigger Pull Request', function() {
    describe('Pull request proccessed comments', function() {
      it('1 #finishes {cardId}', function() {
        mock('request', function (options, func) {
          options.method.should.satisfy(function(value) {return /PUT|GET|POST/.test(value)});
          if (options.method === "GET") {
            options.url.should.be.a("string");
            func(null,null, JSON.stringify([{
              commit: {
                author: {
                  name: "n4ch03"
                },
                message: "#finishes {cardId}"
              }
            }]));
          } else {
            if (options.method === "PUT") {
              options.qs.value.should.be.a('string');
              options.uri.should.be.a("string");
            } else if (options.method === "POST") {
              options.qs.text.should.be.a('string');
            }
            func();
          }
        });
        wt = require(__dirname + '/github-power-up-simple.js');
        data = {
          action: 'opened',
          pull_request: {
            commits_url: 'http://someurl',
            html_url: 'http://pullrequest'
          }
        };
        wt({data:data}, function(error, body){
          console.log(body);
          body.should.have.property("message", "Pull Processed");
          body.should.have.property("results").to.deep.equal(buildPullOracle(["New Pull Request from n4ch03: http://pullrequest"]));
        });
      });
    });
  });
});

function buildPullOracle(comments) {
  var oracleArr = [];
  comments.forEach(function(comment) {
    oracleArr.push(
      {
        "comment": comment,
        "listId": pullListId,
        "processed": true
      }
    );
  });
  return oracleArr;
}
