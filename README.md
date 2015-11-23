# trello-github-power-up

## Motivation

Recently Trello released [Github Power Up](http://blog.trello.com/github-and-trello-integrate-your-commits/). 

Given that:
* Most of things I would like to have integrated with Github are related to move Cards automatically from List to List depending on Github action
* Trello API and Github Webhooks are free to use
* I do not need to mantain an Amazon server or something like that to have an endpoint listening to Github webhooks: (Webtasks) [https://webtask.io/]. Easy to deploy and quick to develop :)
* Pricing of Webtasks for this use case are more than (attractive) [https://webtask.io/pricing]

**I started a POC that allows me to:**

* Any time that I commit and push to MASTER with the format **#finishes {cardID}** the cardId in Trello will be moved to **Finished List**. 
* Any time that I commit and push to MASTER with the format **#accepts {cardID}** the cardId in Trello will be moved to **Accepted List**.
* Any time I create a pull request if any commit has the any of the previous formats, a comment with a link to the pull request will be created and the Card will be moved to **Ready To Review List**.

The Flow I'm using in Trello is simple:
* Open: Cards for the current sprint
* In Progress: Cards that we are developing
* Ready To Review: Cards ready to review(pull request)
* Finished: Merged and ready for some extra testing, for example integration automated tests or functional automated test.
* Accepted: The Card is in the main branch and fully tested 


## How to install:

### Get Trello Key and Token

* Logged in Trello Go to https://trello.com/app-key and get you api key(TRELLO_KEY)
* Go to https://trello.com/1/connect?key=YOUR_KEY&name=WHATEVER_NAME_YOU_WANT&response_type=token&scope=read,write and get your api token (TRELLO_TOKEN)

### Create a Trello Board

For the purpose to play around with this power up just use the following account: n4ch03webtaskbot:Auth0webtask and Board: [Github Power-Up](https://trello.com/b/aPgw3ceN/github-power-up)

The following ids will be used to identify the Ready To Review, Finished and Accepted Lists.
* READY_TO_REVIEW: 565281d419214626a8574888
* FINISHED: 565281e19cdc1f789bf9ae6f
* ACCEPTED: 565281e358b5a991f5a9174c

### Deploy the WebTask

```
wt create https://raw.githubusercontent.com/n4ch03/trello-github-power-up/master/web-tasks/github-power-up-simple.js \
--name github-power-up \
--secret TRELLO_KEY=b698760335546616a2284800d5db6d1d \
--secret TRELLO_TOKEN=7b89374ca1afa36d48c0aee6bfc6cbb7870c095d8efbad7dfa83fc286b852ae5 \
--secret READY_TO_REVIEW=565281d419214626a8574888 \
--secret FINISHED=565281e19cdc1f789bf9ae6f \
--secret ACCEPTED=565281e358b5a991f5a9174c \
```

This command will return a URL, just take note of it, we'll be using it to setup [Github Webhooks](https://developer.github.com/webhooks/)

### Setup the Github Webhooks

We will be seting webhooks for 2 actions:
* push: we will be listening for commits in the main branch with the following format: "#finishes {TrelloCardId}" or "#accepts {TrelloCardId}".
* pull request: we will be listening every new pull request, check if some commit has cards associated and move the Trello cards to the Ready to Review List and a comment with a link to the pull request.

![](https://dl.dropboxusercontent.com/u/3835331/GIthubWebhooks.gif)

### Working in Master Sample
![](https://dl.dropboxusercontent.com/u/3835331/MasterCommits.gif)

### Pull Request Sample
![](https://dl.dropboxusercontent.com/u/3835331/PullRequest.gif)
