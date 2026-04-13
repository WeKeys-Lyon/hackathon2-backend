const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String, required: true},
    avatar: {type: Number, required: true},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref:'tweets'}]
});

const User = mongoose.model('users', userSchema);

module.exports = User;