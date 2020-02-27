/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");
var connect = require("./src/connect");
var model = require("./src/model");
var query = require("./src/query");


module.exports = function RapidQuery(options) {
    //constructor
    this.db = connect(options);

    //type defines
    this.ObjectId = mongoose.Types.ObjectId;
    this.Mixed = mongoose.Types.Mixed;
    this.Decimal128 = mongoose.Types.Decimal128;

    //model define
    this.define = model.define;

    //Query
    this.query = query;

    //Middleware
    this.middleware = {
        express: (req, res, next) => {
            if (JSON.stringify(req.body) != "{}") {
                this.query(JSON.parse(req.body.query)).then(data => {
                    res.send(data);
                });
            }

            if (JSON.stringify(req.query) != "{}") {
                this.query(JSON.parse(req.query.query)).then(data => {
                    res.send(data);
                });
            }

            next();
        },
        koa: async(ctx, next) => {

            options.api = options.api ? options.api : "/rapidquery"

            if (ctx.url === options.api && ctx.method === "POST") {
                try {
                    if (ctx.request.body.query) {
                        var data = await this.query(ctx.request.body.query);
                        ctx.type = "application/json"
                        ctx.body = data;
                    } else {
                        throw new Error("Query JSON is required.")
                    }
                } catch (err) {
                    ctx.status = 400;
                    ctx.body = `${err.name} : ${err.message}`;
                    console.error(err)
                }
            }
            await next()
        }
    };
}