/**
 * Wechat Work bots for creating chat rooms, etc
 *
 * Author: billtt
 */

module.exports = bot => {
    // chat creation
    bot.respond(/chat create ([a-zA-Z0-9]+) ([a-zA-Z0-9]+(,[a-zA-Z0-9]+)+)/i, async msg => {
        const chatId = msg.match[1];
        const users = msg.match[2].split(',');
        const owner = msg.envelope.user.id;
        const err = await bot.wwork.createChat(chatId, users, owner);
        if (err) {
            msg.send(`Error creating chat:\n${err}`);
        } else {
            msg.send(`OK!`);
            bot.wwork.sendChatMessage(chatId, 'Chat created!');
        }
    });
};
