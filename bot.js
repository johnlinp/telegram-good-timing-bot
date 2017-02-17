var token = process.env.BOT_TOKEN;

var Bot = require('node-telegram-bot-api');
var Parser = require('./parser');
var Sender = require('./sender');

var bot;
if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
} else {
    bot = new Bot(token, { polling: true });
}

var parser = new Parser();
var sender = new Sender(bot);

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on('text', function (msg) {
    parser.parseMsg(msg, function(msg, action, args) {
        sender.sendMsg(msg, action, args);
    });
});

module.exports = bot;
