var token = process.env.BOT_TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

var models = require('./models');

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
} else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

var parseSentence = function(msg, callback) {
    var matches;

    matches = /^\/start/i.exec(msg.text);
    if (matches) {
        callback(msg, 'START');
        return;
    }

    matches = /^\/help/i.exec(msg.text);
    if (matches) {
        callback(msg, 'HELP');
        return;
    }

    matches = /^(.+) when i am (.+)$/i.exec(msg.text);
    if (matches) {
        callback(msg, 'ADD-TODO', {
            plan: matches[1],
            timing: matches[2],
        });
        return;
    }

    matches = /^i am (.+)$/i.exec(msg.text);
    if (matches) {
        callback(msg, 'WHAT-TO-DO', {
            timing: matches[1],
        });
        return;
    }

    matches = /^done$/i.exec(msg.text);
    if (matches) {
        callback(msg, 'REMOVE-TODO');
        return;
    }

    callback(msg, 'UNKNOWN');
};

var sendSimpleResponse = function(msg, action) {
    switch (action) {
        case 'START':
            bot.sendMessage(msg.chat.id, 'Welcome!\nType "buy some socks when i am at some store" or type /help to see the usage.');
            return true;
        case 'HELP':
            bot.sendMessage(msg.chat.id, 'I can understand the following patterns:\n\n1. [do something] when I am [some context]\n2. I am [some context]\n3. done');
            return true;
        case 'UNKNOWN':
            bot.sendMessage(msg.chat.id, 'What?');
            return true;
        default:
            return false;
    }
};

var sendTimingResponse = function(msg, action, args, profile) {
    switch (action) {
        case 'ADD-TODO':
            bot.sendMessage(msg.chat.id, 'Okay, I will remind you to ' + args.plan + ' when you are ' + args.timing + '.');
            return;
        case 'WHAT-TO-DO':
            if (args.plans.length == 0) {
                bot.sendMessage(msg.chat.id, 'Nothing to do.');
            } else if (args.plans.length == 1) {
                bot.sendMessage(msg.chat.id, 'Go ' + args.plans[0] + '.');
            } else {
                bot.sendMessage(msg.chat.id, 'Go do these things:\n' + args.plans.join('\n'));
            }
            return;
        case 'REMOVE-TODO':
            bot.sendMessage(msg.chat.id, 'Great job!');
            return;
    }
};

var updateProfileAndArgs = function(msg, action, args, profile) {
    switch (action) {
        case 'ADD-TODO':
            profile.currTiming = null;
            if (profile.todoList.length >= 100) {
                bot.sendMessage(msg.chat.id, 'Too many things to do!');
                return false;
            }
            var sameTodo = profile.todoList.filter(function(todo) {
                return (todo.timing == args.timing && todo.plan == args.plan);
            });
            if (sameTodo.length != 0) {
                bot.sendMessage(msg.chat.id, 'You already told me that.');
                return false;
            }
            profile.todoList.push({
                timing: args.timing,
                plan: args.plan,
            });
            return true;
        case 'WHAT-TO-DO':
            profile.currTiming = args.timing;
            var targetTodoList = profile.todoList.filter(function(todo) {
                return (todo.timing == args.timing);
            });
            args.plans = targetTodoList.map(function(todo) {
                return todo.plan;
            });
            return true;
        case 'REMOVE-TODO':
            if (!profile.currTiming) {
                bot.sendMessage(msg.chat.id, 'What is your timing now?');
                return false;
            }
            profile.todoList = profile.todoList.filter(function(todo) {
                return (todo.timing != profile.currTiming);
            });
            profile.currTiming = null;
            return true;
        default:
            return false;
    }
};

var doAction = function(msg, action, args) {
    args = args || {};

    if (sendSimpleResponse(msg, action)) {
        return;
    }

    models.Profile.findOne({userId: msg.from.id})
            .exec(function(err, profile) {
        if (err) {
            bot.sendMessage(msg.chat.id, 'Something went wrong...');
            return;
        }

        if (!profile) {
            var profile = new models.Profile({
                userId: msg.from.id,
                currTiming: null,
                todoList: [],
            });
        }

        if (!updateProfileAndArgs(msg, action, args, profile)) {
            return;
        }

        profile.save(function(err) {
            if (err) {
                bot.sendMessage(msg.chat.id, 'Something went wrong...');
                return;
            }
            sendTimingResponse(msg, action, args, profile);
        });
    });
};

bot.onText(/(.+)/, function (msg) {
    parseSentence(msg, doAction);
});

module.exports = bot;
