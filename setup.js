var request = require('request');
var config = require('./config.js');

var sendTelegramApi = function(methodName, formData, callback) {
    var API_URL = 'https://api.telegram.org/';

    request.post({
        url: API_URL + 'bot' + config.token + '/' + methodName,
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

var checkTokenValid = function() {
    process.stdout.write('checking token... ');
    sendTelegramApi('getMe', null, function(json) {
        console.log('token is valid');
        setWebhook();
    });
};

var setWebhook = function() {
    process.stdout.write('setting web hook... ');
    sendTelegramApi('setWebhook', {
        url: config.webhookUrl,
    }, function(json) {
        console.log('webhook set to', config.webhookUrl);
    });
};

var main = function() {
    checkTokenValid();
};

main();
