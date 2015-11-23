# trello-github-power-up

## HOW TO INSTALL IT AND USE:

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
