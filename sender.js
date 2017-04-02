var i18n = require("i18n");

i18n.configure({
    directory: __dirname + '/locales',
});

i18n.setLocale(process.env.BOT_LANGUAGE);

module.exports = function(bot, models) {
    this.sendStart = function(msg, action, args) {
        bot.sendMessage(msg.chat.id, i18n.__('welcome'));
    };

    this.sendHelp = function(msg, action, args) {
        bot.sendMessage(msg.chat.id, i18n.__('help'));
    };

    this.sendUnknown = function(msg, action, args) {
        bot.sendMessage(msg.chat.id, i18n.__('what'));
    };

    this.sendAddTodo = function(msg, action, args) {
        bot.sendMessage(msg.chat.id, i18n.__('remind', args));
    };

    this.sendWhatToDo = function(msg, action, args) {
        if (args.plans.length == 0) {
            bot.sendMessage(msg.chat.id, i18n.__('do-nothing'));
        } else if (args.plans.length == 1) {
            bot.sendMessage(msg.chat.id, i18n.__('do-single-thing', args.plans[0]));
        } else {
            bot.sendMessage(msg.chat.id, i18n.__('do-multiple-things', args.plans.join('\n')));
        }
    };

    this.sendWhatNow = function(msg, action, args) {
        if (args.timings.length == 0) {
            bot.sendMessage(msg.chat.id, i18n.__('do-nothing'));
        } else if (args.timings.length == 1) {
            bot.sendMessage(msg.chat.id, i18n.__('ask-single-timing', args.timings[0]));
        } else {
            bot.sendMessage(msg.chat.id, i18n.__('ask-multiple-timings', args.timings.join('\n')));
        }
    };

    this.sendRemoveTodo = function(msg, action, args) {
        bot.sendMessage(msg.chat.id, i18n.__('great'));
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

    this.sendBeforeSaveResponse = function(msg, action, args) {
        switch (action) {
            case 'WHAT-NOW':
                this.sendWhatNow(msg, action, args);
                return true;
            default:
                return false;
        }
    };

    this.sendAfterSaveResponse = function(msg, action, args) {
        switch (action) {
            case 'ADD-TODO':
                this.sendAddTodo(msg, action, args);
                return;
            case 'WHAT-TO-DO':
                this.sendWhatToDo(msg, action, args);
                return;
            case 'REMOVE-TODO':
                this.sendRemoveTodo(msg, action, args);
                return;
        }
    };

    this.updateProfileAndArgs = function(msg, action, args, profile) {
        switch (action) {
            case 'ADD-TODO':
                profile.currTiming = null;
                if (profile.todoList.length >= 100) {
                    bot.sendMessage(msg.chat.id, i18n.__('too-many-things'));
                    return false;
                }
                var sameTodo = profile.todoList.filter(function(todo) {
                    return (todo.timing == args.timing && todo.plan == args.plan);
                });
                if (sameTodo.length != 0) {
                    bot.sendMessage(msg.chat.id, i18n.__('already-told'));
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
                    bot.sendMessage(msg.chat.id, i18n.__('what-timing'));
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

        models.Profile.findOne({userId: msg.from.id}, function(err, profile) {
            if (err) {
                bot.sendMessage(msg.chat.id, i18n.__('something-wrong'));
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

            if (me.sendBeforeSaveResponse(msg, action, args)) {
                return;
            }

            profile.save(function(err) {
                if (err) {
                    bot.sendMessage(msg.chat.id, i18n.__('something-wrong'));
                    return;
                }
                me.sendAfterSaveResponse(msg, action, args);
            });
        });
    };
};
