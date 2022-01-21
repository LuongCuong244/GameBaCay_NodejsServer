const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    userName: {type: String, trim: true, maxlength: 50, required: true, unique: true},
    avatar: String,
    coin: {type: Number, required: true}, // lấy theo ID
    diamond: {type: Number, required: true},
    connected: {type: Boolean, required: true},
    accessToken: String,
    refeshToken: String,
    logInWith: {type: String, required: true},
},{
    timestamps: true,
});

module.exports =  mongoose.model('User',User);