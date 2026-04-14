const mongoose = require('mongoose');

const trendSchema = mongoose.Schema({
    hashtags: {type: String, required: true, unique: true},
    count: {type: Number, required: true},
});

const Trend = mongoose.model('trends', trendSchema);

module.exports = Trend;
