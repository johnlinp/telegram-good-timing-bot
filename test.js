var sinon = require('sinon')
var chai = require('chai');


describe('parser.js', function() {
    var Parser = require('./parser');
    var parser = new Parser();

    it('parse /start', function() {
        var spy = sinon.spy();
        var msg = {text: '/start'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'START'));
    });

    it('parse /help', function() {
        var spy = sinon.spy();
        var msg = {text: '/help'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'HELP'));
    });

    it('parse add todo', function() {
        var spy = sinon.spy();
        var msg = {text: 'buy some socks when i am at store'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'ADD-TODO', {
            plan: 'buy some socks',
            timing: 'at store',
        }));
    });

    it('parse what now', function() {
        var spy = sinon.spy();
        var msg = {text: 'what now'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'WHAT-NOW'));
    });

    it('parse done', function() {
        var spy = sinon.spy();
        var msg = {text: 'done'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'DONE'));
    });

    it('parse remove todo - keyword', function() {
        var spy = sinon.spy();
        var msg = {text: 'about chicken'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'REMOVE-TODO', {
            removeAll: false,
            removeKeyword: 'chicken',
        }));
    });

    it('parse remove todo - all', function() {
        var spy = sinon.spy();
        var msg = {text: 'all'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'REMOVE-TODO', {
            removeAll: true,
        }));
    });

    it('parse unknown', function() {
        var spy = sinon.spy();
        var msg = {text: 'hello'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'UNKNOWN'));
    });
});


describe('sender.js', function() {
    var Sender = require('./sender');
    var bot = {sendMessage: sinon.spy()};
    var models = require('./models');
    var sender = new Sender(bot, models);
    var msg = {chat: {id: 0}, from: {id: 0}};
    var i18n = require("i18n");
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('send /start', function() {
        sender.sendMsg(msg, 'START');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('welcome')));
    });

    it('send /help', function() {
        sender.sendMsg(msg, 'HELP');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('help')));
    });

    it('send add todo', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [],
        });
        var args = {
            plan: 'eat',
            timing: 'hungry',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'ADD-TODO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('remind', args)));
        chai.assert(profile.todoList.length === 1);
        chai.assert(profile.todoList[0].timing === args.timing);
        chai.assert(profile.todoList[0].plan === args.plan);
    });

    it('send what to do - empty', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [],
        });
        var args = {
            timing: 'hungry',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-TO-DO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('do-nothing')));
        chai.assert(profile.currTiming === args.timing);
    });

    it('send what to do - single', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat',
                }
            ],
        });
        var args = {
            timing: 'hungry',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-TO-DO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('do-single-thing', profile.todoList[0].plan)));
        chai.assert(profile.currTiming === args.timing);
    });

    it('send what to do - multiple', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var args = {
            timing: 'hungry',
        };
        var plans = [
            'eat noodles',
            'eat chicken',
            'eat soup',
        ];

        var timings = [];
        profile.todoList.forEach(function(todo) {
            timings.push(todo.timing);
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-TO-DO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('do-multiple-things', plans.join('\n'))));
        chai.assert(profile.currTiming === args.timing);
    });

    it('send done - one todo', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'DONE');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('great')));
    });

    it('send done - many todos', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'DONE');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('whats-been-done')));
    });

    it('send done - no curr timing', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'DONE');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('what-timing')));
    });

    it('send remove todo - single', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var args = {
            removeAll: false,
            removeKeyword: 'noodles',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'REMOVE-TODO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('removed-single', 'eat noodles')));
        chai.assert(profile.todoList.length === 3);
    });

    it('send remove todo - multiple', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken rice',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var args = {
            removeAll: false,
            removeKeyword: 'chicken',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'REMOVE-TODO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('removed-multiple', 'eat chicken rice\neat chicken soup')));
        chai.assert(profile.todoList.length === 2);
    });

    it('send remove todo - all', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var args = {
            removeAll: true,
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'REMOVE-TODO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('great')));
        chai.assert(profile.todoList.length === 1);
        chai.assert(profile.todoList[0].timing === 'tired');
        chai.assert(profile.todoList[0].plan === 'sleep');
    });

    it('send remove todo - none', function() {
        var currTiming = 'hungry';
        var profile = new models.Profile({
            userId: 0,
            currTiming: currTiming,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat noodles',
                },
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var args = {
            removeAll: false,
            removeKeyword: 'sleep',
        };

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'REMOVE-TODO', args);
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('removed-none', args.removeKeyword)));
        chai.assert(profile.todoList.length === 4);
    });

    it('send what now - empty', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('do-nothing')));
    });

    it('send what now - single', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat',
                }
            ],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('ask-single-timing', profile.todoList[0].timing)));
    });

    it('send what now - multiple', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [
                {
                    timing: 'hungry',
                    plan: 'eat chicken',
                },
                {
                    timing: 'hungry',
                    plan: 'eat soup',
                },
                {
                    timing: 'thirsty',
                    plan: 'drink',
                },
                {
                    timing: 'tired',
                    plan: 'sleep',
                },
            ],
        });
        var timings = [
            'hungry',
            'thirsty',
            'tired',
        ];

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);
        sandbox.stub(profile, 'save').yields(null);

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('ask-multiple-timings', timings.join('\n'))));
    });

    it('send unknown', function() {
        sender.sendMsg(msg, 'UNKNOWN');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, i18n.__('what')));
    });
});
