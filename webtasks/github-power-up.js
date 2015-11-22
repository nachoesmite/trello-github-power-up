"use latest";

var Express = require('express');
var bodyParser = require('body-parser');
var Webtask = require('webtask-tools');
var app = Express();
var request = require('request');

app.use(bodyParser.json());

// POST
app.post('/push', function (req, res) {
  console.log('[Express-Webtask]Processing Post');
  if (req.body.ref !== 'refs/heads/master') {
    notInterestedActionResponse(res)
  } else {
    req.body.commits.forEach(function (commit) {
      processCommit(commit);
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({"message": "All commits were procesed"}));
  }
});

// POST
app.post('/pull-request', function (req, res) {
  if (req.body.pull_request.state !== "open") {
    notInterestedActionResponse(res)
  } else {
    var options = {
      url: req.body.pull_request.commits_url,
      method: "GET",
      headers: {
        'User-Agent': 'n4ch03'
      }
    };
    request(options, function (error, response, body) {
        if (error) {
          console.log(error);
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({"message": "Problems getting commits from pull request"}));
        } else {
          console.log(config);
          JSON.parse(body).forEach(function (commit) {
            processCommitMessageForPullRequest(commit.commit.message,
              commit.commit.author.name,
              req.body.pull_request.html_url);
          });
        }
    });
    res.send(200);
  }

});

var config = {
  //case insensitive search i
  //multi line m
  // not global search to match the first occurence
  trelloKey: "f6f69490dd4702462cf7f7b969a5a632",
  trelloToken: "29110cc140dfdee85f202459959c1ce408ea311c1cb674d38e6adb7822bf0793",
  finishedRegExp: /#finishes {(\w+)}/im,
  acceptedRegExp: /#accepts {(\w+)}/im,
  boardIds: {
    readyToReview: "5650efcf30344c50260e27b7",
    finished: "565089d21d02cd33b5e31164",
    accepted: "565089d40f6103ddb430baed"
  }
};

function notInterestedActionResponse(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({"message": "No action required due the type of event"}));
}

function processCommit(commit) {
  console.log("Processing commit: " + commit.message);
  var cardId;
  // if commit finishes a card
  if (config.finishedRegExp.test(commit.message)) {
    cardId = config.finishedRegExp.exec(commit.message)[1];
    processFinished(cardId);
  // else if commit accepts a card
  } else if (config.acceptedRegExp.test(commit.message)) {
    cardId = config.acceptedRegExp.exec(commit.message)[1];
    processAccepted(cardId);
  }
}

function processCommitMessageForPullRequest(message, author, pullRequestUrl) {
  var cardId = config.finishedRegExp.exec(message) ||
           config.acceptedRegExp.exec(message);
  if (cardId !== null) {
    cardId = cardId[1];
  }
  processReadyToReview(cardId, author, pullRequestUrl);
}

function processFinished(cardId) {
  console.log("Finishing " + cardId);
  var trello = new Trello(config);
  trello.finishCard(cardId);
}

function processAccepted(cardId) {
  console.log("Accepting " + cardId);
  var trello = new Trello(config);
  trello.acceptCard(cardId);
}

function processReadyToReview(cardId, author, pullRequestUrl) {
  console.log("Adding To Review " + cardId);
  var trello = new Trello(config);
  trello.readyToReviewCard(cardId, author, pullRequestUrl);
}

//starting trello api

var Trello = function (config) {
  this.key = config.trelloKey;
  this.token = config.trelloToken;
  this.lists = config.boardIds;
  this.baseUri = "https://api.trello.com";
}


Trello.prototype.assignCardToList = function (cardId, listId) {
  var options = {
    method: "PUT",
    uri: `${this.baseUri}/1/cards/${cardId}/idList`,
    qs: {
      key: this.key,
      token: this.token,
      value: listId
    }
  };
  console.log(`Options to send: ${JSON.stringify(options)}`);
  request(options, function(error, response, body) {
    if (error) {
      console.log(`error:${error}`);
    } else {
      console.log(`Card:${cardId} Processed`);
      console.log(`Response:${JSON.stringify(response)}`);
      console.log(`Body:${body}`);
    }
  });
}

Trello.prototype.addCommentToCard = function (cardId, comment) {
  var options = {
    method: "POST",
    uri: `${this.baseUri}/1/cards/${cardId}/actions/comments`,
    qs: {
      key: this.key,
      token: this.token,
      text: comment
    }
  };
  console.log(`Options to send: ${JSON.stringify(options)}`);
  request(options, function(error, response, body) {
    if (error) {
      console.log(`error:${error}`);
    } else {
      console.log(`Card:${cardId} Commented`);
      console.log(`Response:${JSON.stringify(response)}`);
      console.log(`Body:${body}`);
    }
  });
}
//callback must attend request callback
Trello.prototype.acceptCard = function (cardId) {
  this.assignCardToList(cardId, this.lists.accepted);
}

Trello.prototype.finishCard = function (cardId) {
  this.assignCardToList(cardId, this.lists.finished);
}

Trello.prototype.readyToReviewCard = function (cardId, author, pullRequestUrl) {
  this.addCommentToCard(cardId, `New Pull Request from ${author}: ${pullRequestUrl}`);
  this.assignCardToList(cardId, this.lists.readyToReview);
}

module.exports = Webtask.fromExpress(app);
