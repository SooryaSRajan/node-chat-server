const express = require("express")
const router = express.Router()
const ChatList = require("../models/chat_list_model")
const Auth = require("../middleware/auth")
const User = require("../models/user_model");

router.get("/:userName", Auth, (req, res) => {

    const requestedUserName = req.params.userName
    const userName = req.user.userName


    User.findOne({userName: requestedUserName}, async function (err, requestedUser) {
        if (err) {
            res.status(500).json({message: "Error while trying to get users", err: err})
            return
        }
        if (!requestedUser) {
            res.status(400).json({message: "User not found"})
            return
        }

        const user = await User.findOne({userName: userName}) //My user information

        if (user.id === requestedUser.id) {
            res.status(400).json({message: "Same users cannot connect"})
            return
        }

        const chatListId = user.chatListId
        const chatId = chatListId.find(chat => chat.userId.toString() === requestedUser._id.toString())

        if (!chatId) {

            const newChatList = new ChatList()

            newChatList.save(function (err) {
                if (err) {
                    res.status(500).json({message: "Error creating new chat group"});
                    return;
                }

                const chatListIdSelf = {
                    userId: requestedUser._id,
                    chatId: newChatList._id
                }

                const chatListIdRequested = {
                    userId: user._id,
                    chatId: newChatList._id
                }

                user.chatListId.push(chatListIdSelf)
                requestedUser.chatListId.push(chatListIdRequested)

                //save
                user.save(function (err) {
                    if (err) {
                        return res.status(500).json({message: "Error while trying to save user", err: err})
                    }
                })

                requestedUser.save(function (err) {
                    if (err) {
                        return res.status(500).json({message: "Error while trying to save user", err: err})
                    }
                })

                res.status(200).json({message: "Chat group created successfully, no chats yet", chatId: newChatList._id})

            });
        } else {
            ChatList.findById(chatId.chatId).select("-_id -__v").exec((err, chats) => {
                if (err) {
                    return res.status(500).json({message: "Error while trying to save user", err: err})
                }
                return res.status(200).json({message: "Chat group already exists, chats are attached", chatId: chatId.chatId, chats: chats})
            })
        }
    })
})

module.exports = router
