/**
 * RapidQuery Main
 * by Timet Zhang
 */
var model = require("./model");

module.exports = query => {
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
      var collection = model.getModels().filter(value => {
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
              parseInt(document.$pageSize) * (parseInt(document.$pageNum) - 1);
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
