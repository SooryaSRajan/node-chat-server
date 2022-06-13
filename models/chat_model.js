const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    sentBy: {
        type: String,
        required: true
    }

});

module.exports = ChatSchema


