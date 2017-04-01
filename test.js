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

    it('parse remove todo', function() {
        var spy = sinon.spy();
        var msg = {text: 'done'};

        parser.parseMsg(msg, spy);
        chai.assert(spy.calledWith(msg, 'REMOVE-TODO'));
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
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('send /start', function() {
        sender.sendMsg(msg, 'START');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Welcome!\nType "buy some socks when i am at some store" or type /help to see the usage.'));
    });

    it('send /help', function() {
        sender.sendMsg(msg, 'HELP');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'I can understand the following patterns:\n\n1. [do something] when I am [some context]\n2. I am [some context]\n3. done'));
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
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Okay, I will remind you to ' + args.plan + ' when you are ' + args.timing + '.'));
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
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Nothing to do.'));
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
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Go ' + profile.todoList[0].plan + '.'));
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
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Go do these things:\n' + plans.join('\n')));
        chai.assert(profile.currTiming === args.timing);
    });

    it('send remove todo', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: 'hungry',
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

        sender.sendMsg(msg, 'REMOVE-TODO');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Great job!'));
        chai.assert(profile.todoList.length === 1);
        chai.assert(profile.todoList[0].timing === 'tired');
        chai.assert(profile.todoList[0].plan === 'sleep');
    });

    it('send what now - empty', function() {
        var profile = new models.Profile({
            userId: 0,
            currTiming: null,
            todoList: [],
        });

        sandbox.stub(models.Profile, 'findOne').yields(null, profile);

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Nothing to do.'));
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

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Are you ' + profile.todoList[0].timing + '?'));
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

        sender.sendMsg(msg, 'WHAT-NOW');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'What timing are you at?\n' + timings.join('\n')));
    });

    it('send unknown', function() {
        sender.sendMsg(msg, 'UNKNOWN');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'What?'));
    });
});
