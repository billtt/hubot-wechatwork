/**
 * Manage Wechat Work Token (refresh automatically)
 *
 * Author: billtt
 */

const request = require('request');

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
        const uri = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.corpId}&corpsecret=${this.secret}`;
        request({uri, json: true}, (err, resp, body) => {
            if (err || !body || !body.access_token) {
                return console.error(`Error getting access token:\n${err}`);
            }
            this.accessToken = body.access_token;
        });
    }

    async sendMessage(userId, message) {
        let uri = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${this.accessToken}`;
        const params = {
            uri,
            method: 'POST',
            json: {
                touser: userId,
                msgtype: 'text',
                agentid: this.agentId,
                text: {
                    content: message
                }
            }
        };
        return new Promise(resolve=>{
            request(params, (err, resp, body) => {
                if (!err && body.errcode && body.errcode !== 0) {
                    err = JSON.stringify(body);
                }
                resolve(err);
            });
        });
    };
}

module.exports = WechatWork;
