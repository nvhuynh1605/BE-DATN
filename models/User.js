const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: String,
    phoneNum: String,
    role: String,
    status: { type: Number, default: 1 },
    avatar: String,
})

const User = mongoose.model('User', userSchema);
module.exports = User;