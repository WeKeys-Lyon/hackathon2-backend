const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    username: [{type: mongoose.Schema.Types.ObjectId, ref:'users'}],
    Content: {type: String, required: true},
    Date: {type: Date, required: true},
    likes: {type: Number, required: true},
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;