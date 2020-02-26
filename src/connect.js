/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");

module.exports = async options => {
    //Connect to the database
    var db = await mongoose.connect(options.host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    db.connection.on("error", console.error.bind(console, "connection error:"));
    db.connection.once("open", function() {
        console.log(`[RapidQuery]Connected to ${options.host}`);
    });
    db.connection.once("close", function() {
        console.log(`[RapidQuery]Close connection to ${options.host}`);
    });
};