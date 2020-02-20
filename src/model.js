/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");

var models = [];
module.exports = {
  // return all models
  getModels: () => {
    return models;
  },
  // define a new model
  define: opt => {
    //automatically add timestamp to meta.
    if (opt.options.timestamp || opt.options.timestamp == undefined) {
      opt.fields.meta = {
        createdAt: Date,
        updatedAt: Date
      };
    }

    var schema = new mongoose.Schema(opt.fields, opt.options);

    //add time NOW to timestamp
    if (opt.options.timestamp || opt.options.timestamp == undefined) {
      //添加createdAt和updatedAt
      schema.pre("save", function(next) {
        // 每次保存之前都插入更新时间，创建时插入创建时间
        if (this.isNew) {
          this.meta.createdAt = this.meta.updatedAt = Date.now();
        } else {
          this.meta.updatedAt = Date.now();
        }
        next();
      });
    }

    //use mongoose to deine a model.
    var model = mongoose.model(opt.name, schema);

    models.push({
      name: opt.name,
      description: opt.description,
      model: model
    });
    return model;
  }
};
