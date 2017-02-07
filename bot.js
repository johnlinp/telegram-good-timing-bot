var token = process.env.BOT_TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
} else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

var parseSentence = function(sentence) {
    var matches;

    matches = /^\/start/i.exec(sentence);
    if (matches) {
        return {
            action: 'START',
        };
    }

    matches = /^\/help/i.exec(sentence);
    if (matches) {
        return {
            action: 'HELP',
        };
    }

    matches = /^(.+) when i am (.+)$/i.exec(sentence);
    if (matches) {
        return {
            action: 'ADD-TODO',
            todo: matches[1],
            timing: matches[2],
        };
    }

    matches = /^i am (.+)$/i.exec(sentence);
    if (matches) {
        return {
            action: 'WHAT-TO-DO',
            timing: matches[1],
        };
    }

    matches = /^done$/i.exec(sentence);
    if (matches) {
        return {
            action: 'REMOVE-TODO',
        };
    }

    return {
        action: 'UNKNOWN'
    };
};

bot.onText(/(.+)/, function (msg, match) {
    var sentence = match[1];
    var args = parseSentence(sentence);

    switch (args.action) {
        case 'ADD-TODO':
            bot.sendMessage(msg.chat.id, 'Okay, I will remind you to ' + args.todo + ' when you are ' + args.timing + '.');
            break;
        case 'WHAT-TO-DO':
            bot.sendMessage(msg.chat.id, 'Go buy some socks.');
            break;
        case 'REMOVE-TODO':
            bot.sendMessage(msg.chat.id, 'Great job!');
            break;
        case 'START':
            bot.sendMessage(msg.chat.id, 'Welcome!\nType "buy some socks when i am at some store" or type /help to see the usage.');
            break;
        case 'HELP':
            bot.sendMessage(msg.chat.id, 'I can understand the following patterns:\n\n1. [do something] when I am [some context]\n2. I am [some context]\n3. done');
            break;
        case 'UNKNOWN':
            bot.sendMessage(msg.chat.id, 'What?');
            break;
    }
});

module.exports = bot;
