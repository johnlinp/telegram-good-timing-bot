var request = require('request');

var sendTelegramApi = function(methodName, formData, callback) {
    var API_URL = 'https://api.telegram.org/';

    request.post({
        url: API_URL + 'bot' + process.env.BOT_TOKEN + '/' + methodName,
        formData: formData,
    }, function(error, response, body) {
        if (error) {
            console.log(methodName, 'error:', error.code);
            return;
        }

        var json = JSON.parse(body);

        if (!json.ok) {
            console.log('error:', methodName, '-', json.error_code, json.description);
            return
        }

        callback(json);
    });
};

var checkTokenValid = function(callback) {
    process.stdout.write('checking token... ');
    sendTelegramApi('getMe', null, function(json) {
        console.log('token is valid');
        callback();
    });
};

var setWebhook = function() {
    process.stdout.write('setting web hook... ');
    sendTelegramApi('setWebhook', {
        url: process.env.BOT_WEBHOOK_URL,
    }, function(json) {
        console.log('webhook set to', process.env.BOT_WEBHOOK_URL);
    });
};

var removeWebhook = function() {
    process.stdout.write('deleting web hook... ');
    sendTelegramApi('deleteWebhook', null, function(json) {
        console.log('webhook deleted');
    });
};

var main = function() {
    if (process.argv.length < 3) {
        console.log('usage:');
        console.log('    node webhook.js <setup|remove>');
        return;
    }

    if (!process.env.BOT_TOKEN) {
        console.log('please run "npm run env" first');
        return;
    }

    var action = process.argv[2];
    if (action == 'setup') {
        checkTokenValid(setWebhook);
    } else if (action == 'remove') {
        checkTokenValid(removeWebhook);
    } else {
        console.log('action can only be "setup" or "remove"');
    }
};

main();
