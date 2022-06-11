//Library imports and declaration
const express = require("express")
const morgan = require('morgan')
const http = require('http');
const app = express()
const server = http.createServer(app);

//TODO: Import and use routes
//Route Imports
const AuthenticationRoute = require("./routes/auth")
const UserRoute = require("./routes/users")
const ChatsRoute = require("./routes/chat")
//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

//Configurations
require("./config/database_connection")();
require("./socket/socket_server").setupSocket(server);


const PORT = process.env.PORT || 8000


//Routes
app.use("/auth", AuthenticationRoute)
app.use("/user", UserRoute)
app.use("/chats", ChatsRoute)

app.get("/", (req, res) => {
    res.send(`Server running on port ${PORT}`)
})

//Sockets


//Port setup and server start
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
