/**
 * RapidQuery Main
 * by Timet Zhang
 */
var model = require("./model");

/**
 * Query
 * @param {JSON} q - query string.
 * @returns {JSON}
 */
module.exports = q => {
    return new Promise((resolve, reject) => {
        if (q) {
            try {
                var query = JSON.parse(q);
                var heads = Object.keys(query);
            } catch (e) {
                throw new Error("Query JSON is not correct.")
            }
        } else {
            throw new Error("Query JSON is Required.")
        }

        if (heads.length <= 0) {
            throw new Error("Query JSON is Required.")
        }

        /**
         * eg.
         * {
         *    "create user": {
         *        name: "tt"
         *    }
         * }
         */
        heads.forEach(item => {
            var t = item.split(" "); // ["create", "user"]

            //validate method
            if (!t.includes("create") && !t.includes("read") && !t.includes("update") && !t.includes("delete")) {
                throw new Error("Query JSON should start with 'create' 'read' 'update' or 'delete'.");
            } else {
                var method = t[0];
            }

            //validate collection name
            var m = model.getModels().filter(value => {
                return value.name === t[1];
            });
            if (m.length <= 0) {
                let message = `Model "${t[1]}" is not exist`;

                //find a collection could be
                let c = model.getModels().filter(value => {
                    return value.name.includes(t[1]);
                });
                if (c) {
                    message += `, do you mean "${c[0].name}"`
                }

                throw new Error(message);

            } else {
                var collection = m[0].model;
            }

            // validate query document
            // is the document a json object
            var document = query[item]; // {name: "tt"}
            if (typeof document !== "object") {
                throw new Error("Query JSON is not correct.")
            }

            switch (method) {
                case "create":
                    collection.create(document, (err, res) => {
                        if (err) reject({ message: err });
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
                            if (err) reject({ message: err });
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
                    if (document.$pageSize) {
                        if (!document.$pageNum) {
                            document.$pageNum = 1
                        }
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
                            if (err) reject({ message: err });
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
                        if (err) reject({ message: err });
                        resolve(res);
                    });
                    break;

                case "delete":
                    collection.deleteMany(document, (err, res) => {
                        if (err) reject({ message: err });
                        resolve(res);
                    });
                    break;
            }
        });
    });
};