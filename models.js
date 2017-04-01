var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = {};

module.exports.connect = function() {
    mongoose.connect(process.env.MONGODB_URI, function(err, res) {
        if (err) throw err;
    });
};

module.exports.Profile = mongoose.model('Profile', new mongoose.Schema({
    userId: Number,
    currTiming: String,
    todoList: [
        {
            timing: String,
            plan: String,
        }
    ],
}));
