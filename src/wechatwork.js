/**
 * Hubot adapter for Wechat Work
 * For configuration and deployment details, see README at GitHub page
 *
 * The following environmental variables are required:
 * WECHATWORK_CORP_ID
 * WECHATWORK_APP_AGENT_ID
 * WECHATWORK_APP_SECRET
 * WECHATWORK_AES_KEY: BASE64 encoded key, acquired from wechat work admin's app management page
 *
 * Author: billtt
 */

const utils = require('./utils');
const Adapter = utils.prequire('hubot/src/adapter');
const {TextMessage} = utils.prequire('hubot/src/message');
const WechatWorkCrypto = require('./wechatwork-crypto');
const parseXmlString = require('xml2js').parseString;
const WechatWork = require('./wechatwork-lib');

const WECHATWORK_CORP_ID = process.env.WECHATWORK_CORP_ID;
const WECHATWORK_APP_AGENT_ID = process.env.WECHATWORK_APP_AGENT_ID;
const WECHATWORK_APP_SECRET = process.env.WECHATWORK_APP_SECRET;

class WechatWorkAdapter extends Adapter {
    constructor(robot) {
        super(robot);
        this.wwork = new WechatWork(WECHATWORK_CORP_ID, WECHATWORK_APP_AGENT_ID, WECHATWORK_APP_SECRET);
        this.robot.wwork = this.wwork;
    }

    run() {
        // initialize express
        const bodyPaser = require('body-parser');
        require('body-parser-xml')(bodyPaser);
        this.robot.router.use(bodyPaser.xml());

        this.robot.router.get('/wechatwork/webhook', this.onWebhookVerify.bind(this));
        this.robot.router.post('/wechatwork/webhook', this.onWebhook.bind(this));

        this.emit('connected');

        // initialize utility bots
        require('./wechatwork-bots')(this.robot);
    }

    send(envelope) {
        const strings = [].slice.call(arguments, 1);
        const msg = strings.join('\n');
        if (envelope.room && envelope.room !== 'na') {
            this.wwork.sendChatMessage(envelope.room, msg);
        } else if (envelope.user && envelope.user.id) {
            this.wwork.sendDirectMessage(envelope.user.id, msg);
        } else {
            this.robot.logger.warning(`Missing user id when sending message: ${JSON.stringify(envelope)}\n${msg}`);
        }
    }

    reply(envelope) {
        const strings = [].slice.call(arguments, 1);
        this.send(envelope, strings.join('\n'));
    }

    onWebhookVerify(req, res) {
        const ciphertext = req.query.echostr;
        if (ciphertext) {
            const message = WechatWorkCrypto.decryptMessage(ciphertext).message;
            res.send(message);
            return res.end();
        } else {
            return res.end();
        }
    }

    onWebhook(req, res) {
        if (req.body.xml && req.body.xml.Encrypt) {
            const ciphertext = req.body.xml.Encrypt[0];
            if (ciphertext) {
                const xml = WechatWorkCrypto.decryptMessage(ciphertext).message;
                parseXmlString(xml, (err, json)=>{
                    if (json.xml) {
                        json = json.xml;
                        if (json.FromUserName && json.FromUserName.length > 0
                            && json.Content && json.Content.length > 0
                            && json.MsgId && json.MsgId.length > 0) {
                            this.onMessageReceived(json.FromUserName[0], json.Content[0], json.MsgId[0]);
                        }
                    }
                });
            }
            return res.end();
        }
    }

    onMessageReceived(fromUser, message, messageId) {
        const user = this.robot.brain.userForId(fromUser, { name: fromUser});
        // append robot name in front of message to trigger listeners
        const tm = new TextMessage(user, this.robot.name + ' ' + message, messageId);
        this.receive(tm);
    }
}

exports.use = (robot) => {
    return new WechatWorkAdapter(robot);
};
