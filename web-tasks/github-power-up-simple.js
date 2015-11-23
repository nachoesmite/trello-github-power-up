"use latest";
var async = require("async");
var request = require("request");

var config = {
  //case insensitive search i
  //multi line m
  // not global search to match the first occurence
  trelloKey: "f6f69490dd4702462cf7f7b969a5a632",
  trelloToken: "29110cc140dfdee85f202459959c1ce408ea311c1cb674d38e6adb7822bf0793",
  githubUA: "n4ch03",
  finishedRegExp: /#finishes {(\w+)}/im,
  acceptedRegExp: /#accepts {(\w+)}/im,
  boardIds: {
    readyToReview: "5650efcf30344c50260e27b7",
    finished: "565089d21d02cd33b5e31164",
    accepted: "565089d40f6103ddb430baed"
  }
};

module.exports = function (context, cb) {
  if(typeof context.data.pull_request === 'object') {
    processPull(context.data, cb);
  } else {
    processPush(context.data, cb);
  }
}

function processPush(data, cb) {
  if (data.ref !== 'refs/heads/master') {
    cb(null, {"message":"No action required"});
  } else {
    async.map(data.commits, processCommit, function (err, results) {
      cb(null, {"message": "Push Processed",
      "results": results});
    });
  }
}

function processPull(data, cb) {
  if (data.action !== "opened") {
    cb(null, {"message":"No action required"});
  } else {
    var options = {
      url: data.pull_request.commits_url,
      method: "GET",
      headers: {
        'User-Agent': config.githubUA
      }
    };
    request(options, function (error, response, body) {
        if (error) {
          cb(null, {"error": error});
        } else {
          async.map(JSON.parse(body),
            function (commit, result) {
              processCommitMessageForPullRequest(commit.commit,
                                                data.pull_request.html_url,
                                                result);
          }, function (err, results) {
            cb(null, {"message": "Pull Processed",
            "results": results});
          });
        }
    });
  }
}

function processCommit(commit, result) {
  var cardId;
  // if commit finishes a card
  if (config.finishedRegExp.test(commit.message)) {
    cardId = config.finishedRegExp.exec(commit.message)[1];
    processFinished(cardId, result);
  // else if commit accepts a card
  } else if (config.acceptedRegExp.test(commit.message)) {
    cardId = config.acceptedRegExp.exec(commit.message)[1];
    processAccepted(cardId, result);
  } else {
    result(null, {processed: false});

  }
}

function processCommitMessageForPullRequest(commit, pullRequestUrl, result) {

  var message = commit.message;
  var author = commit.author.name;

  var cardId = config.finishedRegExp.exec(message) ||
           config.acceptedRegExp.exec(message);

  if (cardId !== null) {
    cardId = cardId[1];
    processReadyToReview(cardId, author, pullRequestUrl, result);
  } else {
    result(null, false);
  }

}

function processFinished(cardId, result) {
  var trello = new Trello(config);
  return trello.finishCard(cardId, result);
}

function processAccepted(cardId, result) {
  var trello = new Trello(config);
  return trello.acceptCard(cardId, result);
}

function processReadyToReview(cardId, author, pullRequestUrl, result) {
  var trello = new Trello(config);
  trello.readyToReviewCard(cardId, author, pullRequestUrl, result);
}



//starting trello api
var Trello = function (config) {
  this.key = config.trelloKey;
  this.token = config.trelloToken;
  this.lists = config.boardIds;
  this.baseUri = "https://api.trello.com";
}


Trello.prototype.assignCardToList = function (cardId, listId, result) {
  // just to add the comment sent to trello to the payload
  var resultObj = {};
  if (arguments.length === 4) {
    resultObj.comment = arguments[3];
  }
  var options = {
    method: "PUT",
    uri: `${this.baseUri}/1/cards/${cardId}/idList`,
    qs: {
      key: this.key,
      token: this.token,
      value: listId
    }
  };
  request(options, function(error, response, body) {
    if (error) {
      result(error, null);
    } else {
      resultObj.processed = true;
      resultObj.listId = listId;
      result(null, resultObj);
    }
  });
}

Trello.prototype.addCommentToCard = function (cardId, comment, result) {
  var options = {
    method: "POST",
    uri: `${this.baseUri}/1/cards/${cardId}/actions/comments`,
    qs: {
      key: this.key,
      token: this.token,
      text: comment
    }
  };
  request(options, function(error, response, body) {
    if (error) {
      result(error, null);
    } else {
      result(null, comment);
    }
  });
}

Trello.prototype.acceptCard = function (cardId, result) {
  this.assignCardToList(cardId, this.lists.accepted, result);
}

Trello.prototype.finishCard = function (cardId, result) {
  this.assignCardToList(cardId, this.lists.finished, result);
}

Trello.prototype.readyToReviewCard = function (cardId, author, pullRequestUrl, result) {
  var that = this;
  this.addCommentToCard(cardId, `New Pull Request from ${author}: ${pullRequestUrl}`, function (error, val) {
    if (error) {
      result(error, null);
    } else {
      that.assignCardToList(cardId, that.lists.readyToReview, result, val);
    }

  });
}
