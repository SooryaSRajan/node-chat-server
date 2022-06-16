const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const ChatList = require("../models/chat_list_model")

let io;

exports.setupSocket = (server) => {
    io = new Server(server);

    User.find({}, (err, user) => {
        user.forEach((userData) => {
            console.log()
            userData.onlineUsers = []
            delete userData.__v
            try {
                userData.save()
            } catch (e) {
                console.log(e)
            }
        })
    })

    io.use((socket, next) => {
        let receiveToken = socket.handshake.headers[process.env.TOKEN]
        if (!receiveToken) {
            next(new Error('Please attach token'))
        }

        try {
            const decodedToken = jwt.verify(receiveToken, process.env.JWT_SECRET_KEY);

            User.findById(decodedToken._id, (err, user) => {
                if (err) {
                    console.log(err)
                    next(new Error(err))
                }

                if (!user) {
                    next(new Error('User does not exist'))
                } else {
                    socket.user = user
                    next();
                }

            })
        } catch (error) {
            console.log(error)
            next(new Error(error))
        }
    });

    io.on('connection', (socket) => {

        console.log(socket.user.userName, 'connected')

        User.findById(socket.user._id, (err, user) => {
            if (!err) {
                delete user.__v
                user.onlineUsers.push(socket.id)
                try {
                    user.save()
                } catch (e) {
                    console.log(e)
                }
                socket.broadcast.emit(socket.user.userName, "ONLINE")
            }
        })

        //Gets current list of all users and updates it
        socket.on('status', (userName) => {
            console.log(userName, 'requested')
            User.findOne({userName: userName}, (err, user) => {
                if (!err) {
                    if (user)
                        if (user.onlineUsers.length === 0) {
                            socket.emit(userName, "OFFLINE")
                            console.log('emitting', userName, 'offline')
                        } else {
                            socket.emit(userName, "ONLINE")
                            console.log('emitting', userName, 'online')
                        }
                }
            })
        })

        //Listener to get message and id, adds message to message list based on id
        socket.on('message', async (message, chatId) => {
            try {
                let date = Date.now()
                const chatList = await ChatList.findById(chatId)
                chatList.chats.push({message: message, date: date, sentBy: socket.user.userName})
                await chatList.save()
                socket.broadcast.emit(chatId.toString(), message, socket.user.userName, date);
                console.log("Message from chat ID: ", chatId.toString(), "message:", message)
            } catch (e) {
                console.log(e)
            }
        })

        socket.on('disconnect', () => {

            //Updates disconnect user list by removing appended user list
            User.findById(socket.user._id, (err, user) => {
                if (!err) {
                    delete user.__v
                    user.onlineUsers = user.onlineUsers.filter(item => item !== socket.id)
                    if (user.onlineUsers.length === 0) {
                        io.emit(socket.user.userName, "OFFLINE")
                    }
                    try {
                        user.save()
                    } catch (e) {
                        console.log(e)
                    }
                }
            })

            console.log('user disconnected');
        });
    });
}

exports.io = () => {
    return io
}
