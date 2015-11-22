"use latest";
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

module.exports =
  function (context, req, res) {
    if (req.method === "POST") {
      //only interested in merges to master or actions to master
      console.log('Processing Post');
      if (context.data.ref !== 'refs/heads/master') {
        notInterestedActionResponse(res, context.data.ref)
      } else {
        context.data.commits.forEach(function (commit) {
          processCommit(commit);
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({"message": "All commits were procesed"}));
      }
    } else {
      console.log('sorry only POST method :)');
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({"message": "method not allowed"}));
    }
  }

function notInterestedActionResponse(res, ref) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({"message": "No action required due the type of push event",
                          "ref": ref}));
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

//starting trello api

var Trello = function (config) {
  this.key = config.trelloKey;
  this.token = config.trelloToken;
  this.lists = config.boardIds;
  this.baseUri = "https://api.trello.com";
  this.request = require("request");
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
  this.request(options, function(error, response, body) {
    if (error) {
      console.log(`error:${error}`);
    } else {
      console.log(`Card:${cardId} Processed`);
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


Trello.prototype.attachPullRequest = function (cardId, pullRequestLink) {

}
