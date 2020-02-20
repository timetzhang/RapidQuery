/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");
var connect = require("./src/connect");
var model = require("./src/model");
var query = require("./src/query");
var middlewareExpress = require("./src/middleware/express");

module.exports = function RapidQuery(options) {
  //type defines
  this.ObjectId = mongoose.Types.ObjectId;

  connect(options);

  this.define = model.define;

  //Query
  this.query = query;

  //Middleware
  this.middleware = {
    express: middlewareExpress
  };
};
