const express = require("express")
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({extended: true}));

require("./config/database_connection")();

app.get("/", (req, res) => {
    res.send(`Server running on port ${PORT}`)
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
