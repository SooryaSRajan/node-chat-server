//TODO: Complete user route
const express = require("express")
const router = express.Router()
const User = require("../models/user_model")
const Auth = require("../middleware/auth")
const ChatList = require("../models/chat_list_model")

router.post("/users", Auth, (req, res) => {

    const userName = req.user.userName

    //select only userName and profileName
    User.find({userName: {$ne: userName}}).select("-_id userName profileName").exec((err, users) => {
        if (err) {
            res.status(500).json({message: "Error while trying to get users", err: err})
            return
        }
        res.status(200).json({message: "Users retrieved successfully", users: users})
    })

})

router.get("/chatId/:userName", Auth, (req, res) => {

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

        if(user.id === requestedUser.id){
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

                res.status(200).json({message: "Chat group created successfully", chatId: newChatList._id})

            });
        } else {
            res.status(200).json({message: "Chat group already exists", chatId: chatId.chatId})
        }
    })
})

router.get("/:userName", (req, res) => {
    const requestedUserName = req.params.userName

    User.findOne({userName: requestedUserName}).select("-_id userName profileName").exec((err, user) => {
        if (err) {
            res.status(500).json({message: "Error while trying to get users", err: err})
            return
        }
        res.status(200).json({message: "User retrieved successfully", users: user})
    })
})

module.exports = router
