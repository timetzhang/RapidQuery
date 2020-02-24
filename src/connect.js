/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");

module.exports = options => {
    //Connect to the database
    mongoose.connect(options.host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    var db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function() {
        console.log("connected");
    });
};