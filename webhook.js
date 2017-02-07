var Bot = require('node-telegram-bot-api');

var main = function() {
    if (process.argv.length < 3) {
        console.log('usage:');
        console.log('    node webhook.js <setup|remove>');
        return;
    }

    if (!process.env.BOT_TOKEN) {
        console.log('please export env vars in .env first');
        return;
    }

    var bot = new Bot(process.env.BOT_TOKEN);
    var action = process.argv[2];
    if (action == 'setup') {
        bot.setWebHook(process.env.HEROKU_URL + process.env.BOT_TOKEN);
    } else if (action == 'remove') {
        bot.setWebHook('');
    } else {
        console.log('action can only be "setup" or "remove"');
    }
};

main();
