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
                eval(`var query = ${q}`);
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
                var options = m[0].options;
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
                        if (err) reject(err);
                        resolve(res);
                        console.log(`[RapidQuery]Create collection "${t[1]}" by ${q}`)
                    });

                    break;

                case "read":
                    //exclude item which has deletedAt
                    if (!document.deletedAt) {
                        document.deletedAt = null;
                    } else {
                        document.deletedAt = {
                            $ne: null
                        }
                    }
                    //count
                    if (document.$count) {
                        delete document.$count;
                        collection
                            .find(document)
                            .countDocuments()
                            .exec((err, res) => {
                                if (err) reject(err);
                                resolve(res);
                                console.log(`[RapidQuery]Read the count of collection "${t[1]}" by ${q}`)
                            });
                        break;
                    }

                    //group
                    if (document.$aggregate) {
                        collection.aggregate(document.$aggregate).exec((err, res) => {
                            if (err) reject(err);
                            resolve(res);
                            console.log(`[RapidQuery]Read the aggregate of collection "${t[1]}" by ${q}`)
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
                            if (err) reject(err);
                            resolve(res);
                            console.log(`[RapidQuery]Read the collection "${t[1]}" by ${q}`)
                        });
                    break;

                case "update":
                    var condition = {};
                    var data = {};

                    data = document.$update;
                    delete document.$update;

                    condition = document;
                    //condition cannot be null
                    if (JSON.stringify(condition) == "{}" || JSON.stringify(condition) == "[]") {
                        throw new Error("Can not update without any filter");
                    } else {
                        collection.updateMany(condition, data, (err, res) => {
                            if (err) reject(err);
                            resolve(res);
                            console.log(`[RapidQuery]Update the collection "${t[1]}" by ${q}, result is ${JSON.stringify(res)}`)
                        });
                    }
                    break;

                case "delete":
                    //condition cannot be null
                    if (JSON.stringify(document) == "{}" || JSON.stringify(document) == "[]") {
                        throw new Error("Can not delete without any filter");
                    } else {
                        if (options.paranoid) {
                            collection.updateMany(document, { deletedAt: Date.now() }, (err, res) => {
                                if (err) reject(err);
                                resolve(res);
                                console.log(`[RapidQuery]Logic delete the collection "${t[1]}" by ${q}, result is ${JSON.stringify(res)}`)
                            });
                        } else {
                            collection.deleteMany(document, (err, res) => {
                                if (err) reject(err);
                                resolve(res);
                                console.log(`[RapidQuery]Delete the collection "${t[1]}" by ${q}, result is ${JSON.stringify(res)}`)
                            });
                        }
                    }
                    break;
            }
        });
    });
};