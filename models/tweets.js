const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    username: [{type: mongoose.Schema.Types.ObjectId, ref:'users'}],
    content: {type: String, required: true},
    date: {type: Date, required: true},
    likes: {type: Number, required: true},
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;