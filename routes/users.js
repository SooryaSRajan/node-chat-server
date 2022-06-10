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
