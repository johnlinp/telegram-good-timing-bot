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
        var matches = /^(.+) when i am (.+)$/i.exec(msg.text);
        if (matches) {
            callback(msg, 'ADD-TODO', {
                plan: matches[1],
                timing: matches[2],
            });
            return true;
        }
        return false;
    };

    this.parseWhatToDo = function(msg, callback) {
        var matches = /^i am (.+)$/i.exec(msg.text);
        if (matches) {
            callback(msg, 'WHAT-TO-DO', {
                timing: matches[1],
            });
            return true;
        }
        return false;
    };

    this.parseRemoveTodo = function(msg, callback) {
        var matches = /^done$/i.exec(msg.text);
        if (matches) {
            callback(msg, 'REMOVE-TODO');
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
