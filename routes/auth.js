const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {passwordStrength} = require('check-password-strength')
const User = require("../models/user_model")
const {io} = require("../socket/socket_server");
const userNameRegex = /^[a-z0-9_.]+$/;

const reservedKeyWords = ['status', 'message', 'disconnect', 'connection', 'new_user_socket_event']

router.post("/login", function (req, res) {

    const {userName, password} = req.body

    if (!userName) {
        res.status(400).json({message: "Please provide a user name"})
        return;
    }

    if (!password) {
        res.status(400).json({message: "Please provide a password"})
        return;
    }

    User.findOne({userName: userName}, async function (err, user) {
        if (err) {
            res.status(500).json({message: "Error while trying to authenticate user", err: err});
            return;
        }

        if (!user) {
            res.status(400).json({message: "This user does not exist"});
            return;
        }

        const checkPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (checkPassword) {
            res.status(200).json({
                message: "User authenticated successfully",
                token: user.generateJWT(),
                profileName: user.profileName
            });
        } else {
            res.status(400).json({message: "Invalid password"});
        }


    })

})

router.post("/register", function (req, res) {

    const {profileName, userName, password} = req.body;

    //validate
    if (!profileName) {
        res.status(400).json({message: "Please provide a profile name"});
        return;
    }

    if (profileName.length <= 3) {
        res.status(400).json({message: "Profile name must be at least 3 characters"});
        return;
    }

    if (/\d/.test(profileName)) {
        res.status(400).json({message: "Profile name must not have numbers"});
        return;
    }

    if (!userName) {
        res.status(400).json({message: "Please provide a user name"});
        return;
    }

    if (userName.length <= 3) {
        res.status(400).json({message: "User name must be at least 3 characters"});
        return;
    }

    if (!userNameRegex.test(userName)) {
        res.status(400).json({message: "Invalid user name format, user name can only have lower case, underscores and numbers"});
        return;
    }

    if (!password) {
        res.status(400).json({message: "Please provide a password"})
        return;
    }

    if(reservedKeyWords.includes(userName)){
        res.status(400).json({message: "Username not allowed, try another username"})
        return;
    }

    if(reservedKeyWords.includes(profileName)){
        res.status(400).json({message: "Username not allowed, try another username"})
        return;
    }

    const verifyPassword = passwordStrength(password)

    if (verifyPassword.id < 2) {
        res.status(400).send({message: "Password is too weak, password should be a minimum of 8 character long, password should have lowercase, uppercase, number and special symbol"})
        return;
    }

    //check if userName is already taken
    User.findOne({userName: userName}, function (err, user) {
        if (err) {
            res.status(500).json({message: "Error checking if user name is taken", err: err});
            return;
        }

        if (user) {
            res.status(400).json({message: "User name is already taken"});
            return;
        }

        bcrypt.hash(password, 10, function (err, hash) {
            if (err) {
                res.status(500).json({message: "Error hashing password"});
                return;
            }

            const newUser = new User({
                profileName: profileName,
                userName: userName,
                password: hash
            });

            newUser.save(function (err) {
                if (err) {
                    res.status(500).json({message: "Error creating user"});
                    return;
                }

                io().emit("new_user_socket_event", profileName, userName)

                res.status(200).json({message: "User created", token: newUser.generateJWT()});
            });

        })
    })
})

module.exports = router;
