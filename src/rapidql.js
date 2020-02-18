var mongodb = require("mongodb").MongoClient;

function RapidQL(options) {
  this.collections = [];
  this.db = async () => {
    try {
      var connection = await mongodb.connect(options.url, {
        useNewUrlParser: true
      });
      return connection.db(options.database);
    } catch (err) {
      throw err;
    }
  };

  this.define = async (collection, fields) => {
    this.collections.push(collection);
    (await this.db()).createCollection(collection, function(err, res) {
      if (err) throw err;
      console.log("Create collection " + collection);
    });
  };

  this.query = query => {
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
      var collection = t[1];
      var document = query[item]; // {name: "tt"}
      var col = (await this.db()).collection(collection);

      switch (method) {
        case "create":
          //if the collection is not exist.
          //it wont create a new collection
          //create document only the collection has defined.
          if (this.collections.includes(collection)) {
            if (document.length > 1) {
              col.insertMany(document, (err, res) => {
                if (err) throw err;
                var result = {
                  data: res.ops,
                  msg: res.result
                };
                console.log(result);
              });
            } else {
              col.insertOne(document, (err, res) => {
                if (err) throw err;
                var result = {
                  data: res.ops,
                  msg: res.result
                };
                console.log(result);
              });
            }
          } else {
            throw new Error("the collection does not exist.");
          }

          break;

        case "query":
          col.find(document).toArray((err, res) => {
            if (err) throw err;
            console.log(res);
          });
          break;

        case "update":
          var condition = {};
          var data = {};
          Object.keys(document).forEach(item => {
            if (item.includes("*")) {
              condition[item.replace("*", "")] = document[item];
            } else {
              data[item] = document[item];
            }
          });
          col.updateMany(
            condition,
            {
              $set: data
            },
            (err, res) => {
              if (err) throw err;
              console.log(res.result);
            }
          );
          break;

        case "delete":
          col.deleteOne(document, (err, res) => {
            if (err) throw err;
            console.log(res.result);
          });
          break;
      }
    });
  };
}

var rapid = new RapidQL({
  url: "mongodb://localhost:27017",
  database: "rapid"
});

rapid.define("user", {
  name: "姓名"
});

rapid.query({
  "create user": [
    {
      name: "a1s",
      tt: {
        kill: 17,
        active: false
      }
    },
    {
      name: "a2s",
      tt: {
        kill: 17,
        active: false
      }
    }
  ]
});
