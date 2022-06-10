const mongoose = require("mongoose");
require("dotenv").config();

function ConnectMongoDBDatabase() {
    console.log("Connecting to database...")

    const databaseConnection = mongoose.connect(
        process.env.CONN_STRING
    );

    databaseConnection.then(() => {
        console.log("Connected to mongoDB database successfully");
    });
    databaseConnection.catch((error) => {
        console.log(`Database connection refused`, error);
    });
}

module.exports = ConnectMongoDBDatabase;
