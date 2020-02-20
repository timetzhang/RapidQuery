/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");
module.exports = function RapidQuery(options) {
  //type defines
  this.ObjectId = mongoose.ObjectId;
  this.newObjectId = () => {
    return mongoose.Types.ObjectId().toString();
  };

  //Connect to the database
  mongoose.connect(options.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    console.log("connected");
  });

  var models = []; //Save all models
  this.define = opt => {
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
  };

  var result;
  //Query
  this.query = query => {
    return new Promise((resolve, reject) => {
      var heads = Object.keys(query);
      /**
       * eg.
       * {
       *    "create user": {
       *        name: "tt"
       *    }
       * }
       */
      heads.forEach(async item => {
        var t = item.split(" "); // ["create", "user"]
        var method = t[0];
        var collection = models.filter(value => {
          return value.name === t[1];
        })[0].model;

        var document = query[item]; // {name: "tt"}

        switch (method) {
          case "create":
            collection.create(document, (err, res) => {
              if (err) reject(err);
              resolve(res);
            });

            break;

          case "read":
            //count
            if (document.$count) {
              delete document.$count;
              collection
                .find(document)
                .countDocuments()
                .exec((err, res) => {
                  if (err) throw err;
                  resolve(res);
                });
              break;
            }

            //group
            if (document.$aggregate) {
              collection.aggregate(document.$aggregate).exec((err, res) => {
                if (err) reject(err);
                resolve(res);
              });
              break;
            }

            //order
            if (document.$order) {
              var order = document.$order;
              delete document.$order;
            }

            //skip and limit
            if (document.$pageSize && document.$pageNum) {
              var limit = parseInt(document.$pageSize);
              var skip =
                parseInt(document.$pageSize) *
                (parseInt(document.$pageNum) - 1);
              delete document.$pageSize;
              delete document.$pageNum;
            }

            //select
            if (document.$select) {
              var select = document.$select;
              delete document.$select;
            }

            collection
              .find(document)
              .sort(order)
              .skip(skip)
              .limit(limit)
              .select(select)
              .exec((err, res) => {
                if (err) reject(err);
                resolve(res);
              });
            break;

          case "update":
            var condition = {};
            var data = {};

            data = document.$update;
            delete document.$update;

            condition = document;

            collection.updateMany(condition, data, (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
            break;

          case "delete":
            collection.deleteMany(document, (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
            break;
        }
      });
    });
  };

  //Middleware
  this.expressMiddleware = (req, res) => {
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
  };
};
