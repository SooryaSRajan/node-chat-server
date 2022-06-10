const express = require("express")
const morgan = require('morgan')
const app = express()
const PORT = process.env.PORT || 8000

const AuthenticationRoute = require("./routes/auth")

//TODO: Import and use routes

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use("/auth", AuthenticationRoute)

require("./config/database_connection")();

app.get("/", (req, res) => {
    res.send(`Server running on port ${PORT}`)
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
