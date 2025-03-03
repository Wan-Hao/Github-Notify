# Github Notifyer

## Short Description

**Github Notifyer** is a tool that forwards **GitHub repository events** (such as PRs, Issues, Pushes, etc.) to **Lark (Feishu)** bots via Webhooks. It helps teams receive GitHub notifications in real-time through Lark, improving **collaboration efficiency.**

## Before set up

### Set up Your Lark Bot in feishu open platform

- First of all, you need to build a application in [developer platform of feishu](https://open.feishu.cn).
- Create a _self-built_ app, and then you can get your **App ID** and **App Secret**.
- Choose **Add application usage** on the left sidebar, create a bot, add it to the chat group you want.
- Make sure the bot has the **permission** to send message to the chat group.(Best to give all permissions.)
- feishu got a [API test platform](https://open.feishu.cn/api-explorer), you can use it to get your **lark group chat_id** which is the search keyword of the chat group you want to send the message to.

And that's all for the Lark part, make sure you have got **App ID**, **App Secret** and **lark group chat_id** in your hand, they will be used in the next step.

See more in [Lark Open Platform](https://open.feishu.cn)

### Set up Github Webhook in your personal repository

- Go to your personal page, get your personal access token. If you do not familiar with this, you can see [Github Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- Go to the repository or organization page, set up a webhook, you don't have to worry about the webhook url, it will be set in the next step.

## Set up

- Fork this repository to your workspace.
- Personally I recommand you to deploy this using [Deno deploy](https://deno.com/deploy), it's free and easy.And basicly you don't have to change anything in the code.I also use deno.kv and deno.env (maybe deno.cron in the near future) to store the data.
- Push your code to the repository and deploy it using Deno deploy.If you don't familiar with this, you can see more details in Deno deploy Doc.
- Put the deploy domain to the webhook url of your repository.Personal suggest you have to choose the all events to send to the webhook.
- Add this var to your deno env:
  - `LARK_APP_ID`
  - `LARK_APP_SECRET`
  - `CHAT_ID`
  - `GH_TOKEN`
- Your can see your log in the console of Deno deploy.

And Basically you have done all the things, just wait for the webhook event from github.

## Version

- **v0.1.0**: Initial version, only support PRs.
  - report the PR status to the lark group.
  - support the card update.

- **v0.2.0**: Add cron job to check the PRs and send the message to the lark group.

keep updating...

## About

- This project is still under development.
- If you have any questions, you can contact me.
- If you have any suggestions, you can also contact me.
- If you have any issues, you can also contact me.
  (PS: I am looking for a job, if you need a developer, you can contact me.My email is in my github profile.)
