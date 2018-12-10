# Hubot Adapter for Wechat Work （企业微信）
Currently, this adapter can:
* Send messages to app created groups
* Send messages to individuals
* Receive messages from individuals

It utilizes Wechat Work's APIs of third-party apps to receive and send messages. But due to the limitations of wechat work's apps, we cannot send messages to groups except those created by said app.

此插件可实现以下功能：
* 向应用创建的群（关联了应用的群）发送消息
* 向个人发送消息
* 接收个人发送的消息

此插件基于企业微信的第三方应用API实现消息的收发。由于目前企业微信API的限制，无法向任意群聊发送消息，而只能发送到由应用创建的群组。（向个人发消息则没有限制）

## Creating App 创建应用
Before using this adapter, you need to create an app in your wechat work's administration page. And take a note of the following strings for future use:
* CorpId - Your corporation ID, which can be found at the bottom of "My Enterprise" page
* App Agent Id - Can be found on the app's page
* App Secret - Can be found on the app's page
* Encoding AES Key - This can be found in the message reception settings of the app you just created. When you first enter the settings page, you need to click "generate" to randomly generate the key.

在使用此adapter之前，你需要在企业微信的管理后台创建一个新的自建应用（或使用已有的应用）。然后你需要获取如下信息以备用：
* CorpId - 可以在管理后台"我的企业"最下面找到
* App Agent Id - 在自建应用的管理页面可以找到
* App Secret - 在自建应用的管理页面可以找到
* Encoding AES Key - 在自建应用的"接收消息"设置中可以找到。第一次打开的时候需要设置相关参数。直接点击"随机获取"即可。URL的填写在后面说明

## Setting Environmental Variables 设置环境变量
You need to set the following variables before starting your Hubot.
在启动Hubot之前你需要设置以下的环境变量（即上面获取的参数）。
```bash
WECHATWORK_CORP_ID
WECHATWORK_APP_AGENT_ID
WECHATWORK_APP_SECRET
WECHATWORK_AES_KEY
PORT
```

`PORT` is the port number (8080 by default) on which the web server listens. The web server will automatically start when Hubot starts and receives messages from wechat work.

其中`PORT`是Web Server监听的端口（默认8080）。Web Server用于从腾讯接收消息回调，并且在Hubot启动时自动启动。

## Finishing Message Reception Settings 完成消息接收设置
After setting all the required environmental variables and starting Hubot, you can finishing the message reception settings on wechat work's admin page.

Just fill in the URL field on the page the URL that Tencent can reach with the suffix of `/wechatwork/webhook`. For example: `https://www.yourdomain.com/wechatwork/webhook`

Then click the "Save" button on the page. If everything goes well, the page will prompt a success message, otherwise please check if your web server can be reached from outside.

在完成了上述的环境变量设置并且启动Hubot之后，你可以继续在企业微信的管理界面完成消息接收设置。

只需要在页面的URL中填入你的Web Server地址（以`/wechatwork/webhook`结尾），例如：`https://www.yourdomain.com/wechatwork/webhook`

然后点击页面上的"保存"。如果一切顺利，会看到设置成功的消息。如果提示出错，请检查你的Web Server是否可以从外部访问。