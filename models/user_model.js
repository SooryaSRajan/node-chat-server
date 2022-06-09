const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    profileName: {
        type: String,
        required: true,
        validate: [function (v) {
            if (v.length <= 3) return false;
            return !/\d/.test(v);
        }, 'invalid name']
    },

    userName: {
        type: String,
        required: true,
        unique: true,
        validate: [function (v) {
            return v.length > 3;
        }, 'invalid user name']
    },

    password: {
        type: String,
        required: true,
        validate: [function (v) {
            if (v.length <= 6) return false;
            return /\d/.test(v);
        }, 'password should be longer and must have numbers']
    },

    chatListId: {
        type: [{
            userId: mongoose.Schema.Types.ObjectId,
            chatId: mongoose.Schema.Types.ObjectId
        }],
        default: []
    }

});

module.exports = UserSchema


