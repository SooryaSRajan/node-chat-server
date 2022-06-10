const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const ChatList = require("../models/chat_list_model")

module.exports = function (server) {
    const io = new Server(server);

    io.use((socket, next) => {
        let receiveToken = socket.handshake.headers[process.env.TOKEN]
        if (!receiveToken) {
            next(new Error('Please attach token'))
        }

        try {
            const decodedToken = jwt.verify(receiveToken, process.env.JWT_SECRET_KEY);
            socket.user = decodedToken

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

        socket.broadcast.emit("status", socket.user.userName, "ONLINE")

        socket.user.chatListId.forEach((data) => {
            let chatId = data.chatId
            socket.on(chatId.toString(), async (payload) => {

                const chatList = await ChatList.findById(chatId)
                chatList.chats.push({message: payload, date: Date.now()})
                await chatList.save()

                socket.broadcast.emit(chatId.toString(), payload, socket.user.profileName);
                console.log("Message from chat ID: ", chatId.toString(), "message:", payload)
            })
        })

        socket.on('disconnect', () => {
            socket.broadcast.emit("status", socket.user.userName, "OFFLINE")
            console.log('user disconnected');
        });
    });

}
