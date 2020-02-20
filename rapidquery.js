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
  //constructor
  connect(options);

  //type defines
  this.ObjectId = mongoose.Types.ObjectId;

  //model define
  this.define = model.define;

  //Query
  this.query = query;

  //Middleware
  this.middleware = {
    express: middlewareExpress
  };
};
