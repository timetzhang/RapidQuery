/**
 * RapidQuery Query Main
 * by Timet Zhang
 * Last Updated at 20200227
 */
var rapidModels = require("./model");

/**
 * Query
 * @param {JSON} q - query string.
 * @returns {JSON}
 */
module.exports = q => {
    return new Promise(async(resolve, reject) => {
        if (q) {
            try {
                // 将通过POST或GET传进来的字符串 q 进行eval object转换
                // 为什么要通过 eval 而不是 JSON.parse 
                // 是因为需要解析 1. 正则表达式 2. 字段名可省略" "
                eval(`var query = ${q}`);

                // heads 保存了几个主字段名，比如 "create user", "update user"
                // 如有多个主字段名，则通过 map forEach 进行同步执行
                var heads = Object.keys(query);

                if (heads.length <= 0) {
                    throw new Error("Query JSON is Required.")
                }
            } catch (e) {
                throw new Error("Query JSON is not correct.")
            }
        } else {
            throw new Error("Query JSON is Required.")
        }

        // 所有查询执行完以后，将数据保存在 finalData
        var finalData = {};

        heads.forEach(item => {
            let head = item.split(" "); // ["create", "user"]

            // Validate method
            // method 为 create, read, update 或 delete, count, group
            // 确认 head 包含了这些
            if (!head.includes("create") &&
                !head.includes("read") &&
                !head.includes("update") &&
                !head.includes("delete") &&
                !head.includes("count") &&
                !head.includes("aggregate")) {
                throw new Error("Query JSON should start with 'create', 'read', 'update', 'delete' or 'count', 'aggregate'.");
            } else {
                var method = head[0];
            }

            // Validate model name
            var modelName = head[1];
            // 通过名称找到对应的 Model
            var m = rapidModels.getModels().filter(value => {
                return value.name === modelName;
            });
            if (m.length <= 0) {
                let message = `Model "${modelName}" is not exist`;

                //找到有可能的Model name
                let c = model.getModels().filter(value => {
                    return value.name.includes(modelName);
                });
                if (c) {
                    message += `, do you mean "${c[0].name}"`
                }

                throw new Error(message);

            } else {
                var model = m[0].model;
                var options = m[0].options;
            }

            // Validate query document
            // 验证 document 是否为 object
            var document = query[item]; // {name: "tt"}
            if (typeof document !== "object") {
                throw new Error("Query JSON is not correct.")
            }

            /**
             * Query Main
             */
            switch (method) {
                case "create":
                    model.create(document, (err, res) => {
                        if (err) reject(err)
                        console.log(`[RapidQuery]Create collection "${modelName}"`)
                        finalData = {
                            ...finalData,
                            [`create_${modelName}`]: res
                        };

                        if (Object.keys(finalData).length == heads.length) {
                            resolve(finalData)
                        }
                    });
                    break;

                case "read":
                    // Exclude item which has deletedAt
                    if (!document.deletedAt) {
                        document.deletedAt = null;
                    }
                    // 如果document中包含 deletedAt: true
                    // 则是进行查询已经逻辑删除的数据
                    else {
                        document.deletedAt = {
                            $ne: null
                        }
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

                    model
                        .find(document)
                        .sort(order)
                        .skip(skip)
                        .limit(limit)
                        .select(select)
                        .exec((err, res) => {
                            if (err) reject(err);
                            console.log(`[RapidQuery]Read the collection "${modelName}" by ${q}`)

                            finalData = {
                                ...finalData,
                                [modelName]: res
                            };

                            if (Object.keys(finalData).length == heads.length) {
                                resolve(finalData)
                            }
                        });
                    break;

                case "count":
                    model
                        .find(document)
                        .countDocuments()
                        .exec((err, res) => {
                            if (err) reject(err);
                            console.log(`[RapidQuery]Read the count of collection "${modelName}" by ${q}`)
                            finalData = {
                                ...finalData,
                                [`count_${modelName}`]: res
                            };

                            if (Object.keys(finalData).length == heads.length) {
                                resolve(finalData)
                            }

                        });
                    break;

                case "aggregate":
                    model.aggregate(document).exec((err, res) => {
                        if (err) reject(err);
                        console.log(`[RapidQuery]Read the aggregate of collection "${modelName}" by ${q}`)
                        finalData = {
                            ...finalData,
                            [`aggregate_${modelName}`]: res
                        };

                        if (Object.keys(finalData).length == heads.length) {
                            resolve(finalData)
                        }
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
                        model.updateMany(condition, data, (err, res) => {
                            if (err) reject(err);

                            console.log(`[RapidQuery]Update the collection "${modelName}" by ${q}, result is ${JSON.stringify(res)}`)
                            finalData = {
                                ...finalData,
                                [`update_${modelName}`]: res
                            };

                            if (Object.keys(finalData).length == heads.length) {
                                resolve(finalData)
                            }

                        });
                    }
                    break;

                case "delete":
                    //condition cannot be null
                    if (JSON.stringify(document) == "{}" || JSON.stringify(document) == "[]") {
                        throw new Error("Can not delete without any filter");
                    } else {
                        if (options.paranoid) {
                            model.updateMany(document, { deletedAt: Date.now() }, (err, res) => {
                                if (err) reject(err);
                                console.log(`[RapidQuery]Logic delete the collection "${modelName}" by ${q}, result is ${JSON.stringify(res)}`)
                                finalData = {
                                    ...finalData,
                                    [`delete_${modelName}`]: res
                                };

                                if (Object.keys(finalData).length == heads.length) {
                                    resolve(finalData)
                                }
                            });
                        } else {
                            model.deleteMany(document, (err, res) => {
                                if (err) reject(err);
                                console.log(`[RapidQuery]Delete the collection "${modelName}" by ${q}, result is ${JSON.stringify(res)}`)
                                finalData = {
                                    ...finalData,
                                    [`delete_${modelName}`]: res
                                };

                                if (Object.keys(finalData).length == heads.length) {
                                    resolve(finalData)
                                }
                            });
                        }
                    }
                    break;
            }
        })
    });
};