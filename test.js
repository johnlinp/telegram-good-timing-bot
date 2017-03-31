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
    var models = {};
    var sender = new Sender(bot, models);
    var msg = {chat: {id: 0}};

    it('send /start', function() {
        sender.sendMsg(msg, 'START');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'Welcome!\nType "buy some socks when i am at some store" or type /help to see the usage.'));
    });

    it('send /help', function() {
        sender.sendMsg(msg, 'HELP');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'I can understand the following patterns:\n\n1. [do something] when I am [some context]\n2. I am [some context]\n3. done'));
    });

    it('send unknown', function() {
        sender.sendMsg(msg, 'UNKNOWN');
        chai.assert(bot.sendMessage.calledWith(msg.chat.id, 'What?'));
    });
});
