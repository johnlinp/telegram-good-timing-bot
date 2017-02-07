var token = process.env.BOT_TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
} else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.onText(/(.+)/, function (msg, match) {
    var content = match[1];
    bot.sendMessage(msg.chat.id, 'You said: "' + content + '"');
});

module.exports = bot;
