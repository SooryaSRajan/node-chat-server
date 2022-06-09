const mongoose = require("mongoose");
const {ChatsModel} = require("./chat_model");

const ChatListSchema = new mongoose.Schema({

    chats: {
        type: [ChatsModel],
    },

});

module.exports = mongoose.model("ChatList", ChatListSchema)


