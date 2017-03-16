var models = require('./models');

module.exports = function(bot) {
    this.sendStart = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                bot.sendMessage(msg.chat.id, 'Welcome!\nType "buy some socks when i am at some store" or type /help to see the usage.');
                return;
            case 'zh-tw':
                bot.sendMessage(msg.chat.id, '歡迎!\n輸入 "去雜貨店的時候要買肥皂" 或是輸入 /help 來看用法。');
                return;
        }
    };

    this.sendHelp = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                bot.sendMessage(msg.chat.id, 'I can understand the following patterns:\n\n1. [do something] when I am [some context]\n2. I am [some context]\n3. done');
                return;
            case 'zh-tw':
                bot.sendMessage(msg.chat.id, '我看得懂以下的模式:\n\n1. 我[情境]的時候要[做事情]\n2. 我[情境]了\n3. 完成');
                return;
        }
    };

    this.sendUnknown = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                bot.sendMessage(msg.chat.id, 'What?');
                return;
            case 'zh-tw':
                bot.sendMessage(msg.chat.id, '蛤?');
                return;
        }
    };

    this.sendAddTodo = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                bot.sendMessage(msg.chat.id, 'Okay, I will remind you to ' + args.plan + ' when you are ' + args.timing + '.');
                return;
            case 'zh-tw':
                bot.sendMessage(msg.chat.id, '好的，我之後會提醒你' + args.timing + '的時候要' + args.plan + '。');
                return;
        }
    };

    this.sendWhatToDo = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                if (args.plans.length == 0) {
                    bot.sendMessage(msg.chat.id, 'Nothing to do.');
                } else if (args.plans.length == 1) {
                    bot.sendMessage(msg.chat.id, 'Go ' + args.plans[0] + '.');
                } else {
                    bot.sendMessage(msg.chat.id, 'Go do these things:\n' + args.plans.join('\n'));
                }
                return;
            case 'zh-tw':
                if (args.plans.length == 0) {
                    bot.sendMessage(msg.chat.id, '沒事做。');
                } else if (args.plans.length == 1) {
                    bot.sendMessage(msg.chat.id, '去' + args.plans[0] + '。');
                } else {
                    bot.sendMessage(msg.chat.id, '去做這些事:\n' + args.plans.join('\n'));
                }
                return;
        }
    };

    this.sendWhatNow = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                if (args.timings.length == 0) {
                    bot.sendMessage(msg.chat.id, 'Nothing to do.');
                } else if (args.timings.length == 1) {
                    bot.sendMessage(msg.chat.id, 'Are you ' + args.timings[0] + '?');
                } else {
                    bot.sendMessage(msg.chat.id, 'What timing are you at?\n' + args.timings.join('\n'));
                }
                return;
            case 'zh-tw':
                if (args.timings.length == 0) {
                    bot.sendMessage(msg.chat.id, '沒事做。');
                } else if (args.timings.length == 1) {
                    bot.sendMessage(msg.chat.id, '你' + args.timings[0] + '嗎？');
                } else {
                    bot.sendMessage(msg.chat.id, '你現在有任何好時機嗎？\n' + args.timings.join('\n'));
                }
                return;
        }
    };

    this.sendRemoveTodo = function(msg, action, args, profile) {
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                bot.sendMessage(msg.chat.id, 'Great job!');
                return;
            case 'zh-tw':
                bot.sendMessage(msg.chat.id, '太棒了!');
                return;
        }
    };

    this.sendSimpleResponse = function(msg, action) {
        switch (action) {
            case 'START':
                this.sendStart(msg, action);
                return true;
            case 'HELP':
                this.sendHelp(msg, action);
                return true;
            case 'UNKNOWN':
                this.sendUnknown(msg, action);
                return true;
            default:
                return false;
        }
    };

    this.sendBeforeSaveResponse = function(msg, action, args, profile) {
        switch (action) {
            case 'WHAT-NOW':
                this.sendWhatNow(msg, action, args, profile);
                return true;
            default:
                return false;
        }
    };

    this.sendAfterSaveResponse = function(msg, action, args, profile) {
        switch (action) {
            case 'ADD-TODO':
                this.sendAddTodo(msg, action, args, profile);
                return;
            case 'WHAT-TO-DO':
                this.sendWhatToDo(msg, action, args, profile);
                return;
            case 'REMOVE-TODO':
                this.sendRemoveTodo(msg, action, args, profile);
                return;
        }
    };

    this.updateProfileAndArgs = function(msg, action, args, profile) {
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
            case 'WHAT-NOW':
                args.timings = [];
                profile.todoList.forEach(function(todo) {
                    if (args.timings.indexOf(todo.timing) === -1) {
                        args.timings.push(todo.timing);
                    }
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

    this.sendMsg = function(msg, action, args) {
        var me = this;

        args = args || {};

        if (me.sendSimpleResponse(msg, action)) {
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

            if (!me.updateProfileAndArgs(msg, action, args, profile)) {
                return;
            }

            if (me.sendBeforeSaveResponse(msg, action, args, profile)) {
                return;
            }

            profile.save(function(err) {
                if (err) {
                    bot.sendMessage(msg.chat.id, 'Something went wrong...');
                    return;
                }
                me.sendAfterSaveResponse(msg, action, args, profile);
            });
        });
    };
};
