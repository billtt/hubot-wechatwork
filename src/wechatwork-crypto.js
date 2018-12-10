/**
 * Crypto functions for Wechat Work
 * Mostly used in message callbacks
 *
 * The following environmental variables are required:
 *
 * WECHATWORK_AES_KEY: BASE64 encoded key, acquired from wechat work admin's app management page
 *
 * Author: billtt
 */

const aesjs = require('aes-js');

const AES_KEY_BASE64 = process.env.WECHATWORK_AES_KEY;
const IV = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];
const AES_KEY_ARRAY = Uint8Array.from(Buffer.from(AES_KEY_BASE64, 'base64'));
const AES_CBC = new aesjs.ModeOfOperation.cbc(AES_KEY_ARRAY, IV);

class WechatWorkCrypto {

    /**
     * Decrypt message sent by Wechat Work
     * @param cipher Base64 encoded ciphertext
     * @return {message, receiveid}
     */
    static decryptMessage(ciphertext) {
        const cipherArray = Uint8Array.from(Buffer.from(ciphertext, 'base64'));
        const decrypted = Buffer.from(AES_CBC.decrypt(cipherArray));
        const length = decrypted.readInt32BE(16);
        const message = decrypted.toString('utf8', 20, 20 + length);
        const receiveid = decrypted.toString('utf8', 20 + length, decrypted.length - 1);
        return {message, receiveid};
    }
}

module.exports = WechatWorkCrypto;
