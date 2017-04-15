module.exports = function() {
    this.parseStart = function(msg, callback) {
        var matches = /^\/start/i.exec(msg.text);
        if (matches) {
            callback(msg, 'START');
            return true;
        }
        return false;
    };

    this.parseHelp = function(msg, callback) {
        var matches = /^\/help/i.exec(msg.text);
        if (matches) {
            callback(msg, 'HELP');
            return true;
        }
        return false;
    };

    this.parseAddTodo = function(msg, callback) {
        var matches, plan, timing;
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^(.+) when i am (.+)$/i.exec(msg.text);
                if (matches) {
                    plan = matches[1];
                    timing = matches[2];
                }
                break;
            case 'zh-tw':
                matches = /^我(.+)的時候要(.+)$/i.exec(msg.text);
                if (matches) {
                    timing = matches[1];
                    plan = matches[2];
                }
                break;
        }

        if (matches) {
            callback(msg, 'ADD-TODO', {
                plan: plan,
                timing: timing,
            });
            return true;
        }
        return false;
    };

    this.parseWhatToDo = function(msg, callback) {
        var matches, timing;
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^i am (.+)$/i.exec(msg.text);
                if (matches) {
                    timing = matches[1];
                }
                break;
            case 'zh-tw':
                matches = /^我(.+)了$/i.exec(msg.text);
                if (matches) {
                    timing = matches[1];
                }
                break;
        }

        if (matches) {
            callback(msg, 'WHAT-TO-DO', {
                timing: timing,
            });
            return true;
        }
        return false;
    };

    this.parseWhatNow = function(msg, callback) {
        var matches, timing;
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^what now$/i.exec(msg.text);
                break;
            case 'zh-tw':
                matches = /^.*要幹嘛$/i.exec(msg.text);
                break;
        }

        if (matches) {
            callback(msg, 'WHAT-NOW');
            return true;
        }
        return false;
    };

    this.parseDone = function(msg, callback) {
        var matches;
        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^done$/i.exec(msg.text);
                break;
            case 'zh-tw':
                matches = /^完成$/i.exec(msg.text);
                break;
        }

        if (matches) {
            callback(msg, 'DONE');
            return true;
        }
        return false;
    };

    this.parseRemoveTodo = function(msg, callback) {
        var matches, keyword;

        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^all$/i.exec(msg.text);
                break;
            case 'zh-tw':
                matches = /^全部$/i.exec(msg.text);
                break;
        }

        if (matches) {
            callback(msg, 'REMOVE-TODO', {
                removeAll: true,
            });
            return true;
        }

        switch (process.env.BOT_LANGUAGE) {
            case 'en-us':
                matches = /^about (.*)$/i.exec(msg.text);
                if (matches) {
                    keyword = matches[1];
                }
                break;
            case 'zh-tw':
                matches = /^(.*)那件$/i.exec(msg.text);
                if (matches) {
                    keyword = matches[1];
                }
                break;
        }

        if (matches) {
            callback(msg, 'REMOVE-TODO', {
                removeAll: false,
                removeKeyword: keyword,
            });
            return true;
        }

        return false;
    };

    this.parseMsg = function(msg, callback) {
        var parsers = [
            this.parseStart,
            this.parseHelp,
            this.parseAddTodo,
            this.parseWhatToDo,
            this.parseWhatNow,
            this.parseDone,
            this.parseRemoveTodo,
        ];

        var ok = parsers.some(function(parser) {
            return parser(msg, callback);
        });

        if (!ok) {
            callback(msg, 'UNKNOWN');
        }
    };
};
