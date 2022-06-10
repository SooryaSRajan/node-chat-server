//Library imports and declaration
const express = require("express")
const morgan = require('morgan')
const app = express()

//TODO: Import and use routes
//Route Imports
const AuthenticationRoute = require("./routes/auth")
const UserRoute = require("./routes/users")

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

//Configurations
require("./config/database_connection")();
const PORT = process.env.PORT || 8000


//Routes
app.use("/auth", AuthenticationRoute)
app.use("/user", UserRoute)
app.get("/", (req, res) => {
    res.send(`Server running on port ${PORT}`)
})

//Port setup and server start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
