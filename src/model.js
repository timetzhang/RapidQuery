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
        //init options
        if (opt.options) {
            opt.options.timestamp = opt.options.timestamp ? opt.options.timestamp : "true";
            opt.options.paranoid = opt.options.paranoid ? opt.options.paranoid : "true";
        } else {
            opt.options = {
                timestamp: true,
                paranoid: true
            }
        }

        //automatically add timestamp to meta.
        if (opt.options.timestamp) {

            opt.fields.createdAt = Date;
            opt.fields.updatedAt = Date;
        }

        var schema = new mongoose.Schema(opt.fields, opt.options);

        //add time NOW to timestamp
        if (opt.options.timestamp) {
            //add field "createdAt"  "updatedAt"
            schema.pre("save", function(next) {
                // 每次保存之前都插入更新时间，创建时插入创建时间
                if (this.isNew) {
                    this.createdAt = this.updatedAt = Date.now();
                } else {
                    this.updatedAt = Date.now();
                }
                next();
            });
        }

        //use mongoose to deine a model.
        var model = mongoose.model(opt.name, schema, opt.name);

        models.push({
            name: opt.name,
            description: opt.description,
            model: model
        });

        return model;
    }
};