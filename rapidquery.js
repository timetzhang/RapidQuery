/**
 * RapidQuery Main
 * by Timet Zhang
 */
var mongoose = require("mongoose");

module.exports = function RapidQuery(options) {
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
    models.push({
      name: opt.model,
      model: mongoose.model(opt.model, new mongoose.Schema(opt.schema)),
      description: opt.description
    });
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
              if (err) throw err;
              resolve(res);
            });

            break;

          case "query":
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
                if (err) throw err;
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
              if (err) throw err;
              resolve(res);
            });
            break;

          case "delete":
            collection.deleteMany(document, (err, res) => {
              if (err) throw err;
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
