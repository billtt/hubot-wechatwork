/**
 * Manage Wechat Work Token (refresh automatically)
 *
 * Author: billtt
 */

const request = require('request');
const URI_PREFIX = 'https://qyapi.weixin.qq.com/cgi-bin';

class WechatWork {
    constructor(corpId, agentId, secret) {
        this.accessToken = null;
        this.corpId = corpId;
        this.agentId = agentId;
        this.secret = secret;
        this.refreshAccessToken();
        setInterval(this.refreshAccessToken.bind(this), 15 * 60000);
    }

    refreshAccessToken() {
        const uri = `${URI_PREFIX}/gettoken?corpid=${this.corpId}&corpsecret=${this.secret}`;
        request({uri, json: true}, (err, resp, body) => {
            if (err || !body || !body.access_token) {
                return console.error(`Error getting access token:\n${err}`);
            }
            this.accessToken = body.access_token;
        });
    }

    /**
     * For internal use only
     * Send a POST request to Wechat Work API
     * @param uri begins with '/'
     * @param json
     * @return {Promise<void>}
     */
    async postAPI(uri, json) {
        let separator = uri.indexOf('?')>=0 ? '&' : '?';
        uri = `${URI_PREFIX}${uri}${separator}access_token=${this.accessToken}`;
        const params = {
            uri,
            method: 'POST',
            json
        };
        return new Promise(resolve=>{
            request(params, (err, resp, body) => {
                if (!err && body.errcode && body.errcode !== 0) {
                    err = JSON.stringify(body);
                }
                resolve(err);
            });
        });
    }

    async sendDirectMessage(userId, message) {
        const json = {
            touser: userId,
            msgtype: 'text',
            agentid: this.agentId,
            text: {
                content: message
            }
        };
        return await this.postAPI('/message/send', json);
    };

    async sendChatMessage(chatId, message) {
        const json = {
            chatid: chatId,
            msgtype: 'text',
            text: {
                content: message
            }
        };
        return await this.postAPI('/appchat/send', json);
    }
}

module.exports = WechatWork;
