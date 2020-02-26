const RapidQuery = require("./index");
var rapid = new RapidQuery({
    host: "mongodb://admin:cl3bkm4fuc@localhost:27017/rapid?authSource=admin"
});

async function run() {
    var users = rapid.define({
        name: "users",
        description: "用户数据",
        fields: {
            id: {
                type: rapid.ObjectId,
                default: rapid.ObjectId()
            },
            firstname: String,
            lastname: String,
            age: {
                type: Number,
                //数值验证, 最小值为15, 最大值为30
                min: 6,
                max: 12
            },
            alias: Array,
            school: {
                name: String
            }
        },
        options: {
            timestamp: true, //可以不填，默认为true, model会自动添加 meta: {createdAt, updatedAt}
            discriminatorKey: "kind"
        }
    });
    var users = rapid.define({
        name: "students",
        description: "用户数据",
        fields: {
            id: {
                type: rapid.ObjectId,
                default: rapid.ObjectId()
            },
            firstname: String,
        },
        options: {
            timestamp: true, //可以不填，默认为true, model会自动添加 meta: {createdAt, updatedAt}
            discriminatorKey: "kind"
        }
    });

    rapid
        .query(`{
        "read students":{
            firstname: "tt4",
        },
        "read users":{
            firstname: "qq"
        },
    }`)
        .then(res => {
            console.log(res)
        });
}

run()

// rapid
//   .query({
//     "create users": [
//       {
//         firstname: "tt",
//         lastname: "zhang",
//         email: "asd@as.com",
//         age: 8,
//         school: {
//           name: "UCLA"
//         }
//       }
//     ]
//   })
//   .then(res => {
//     console.log(res);
//   })
//   .catch(err => {
//     console.log(err);
//   });



// rapid
//   .query({
//     "query users": {
//       $pageSize: 1,
//       $pageNum: 2
//     }
//   })
//   .then(res => {
//     console.log(res);
//   });

// rapid.query({
//   "query users": {
//     $or: [{ age: 22 }, { age: 29 }]
//   }
// });

// rapid.query({
//   "update users": {
//     "*firstname": "tt",
//     age: 35
//   }
// });

// rapid.query({
//   "delete users": {
//     $age: 29
//   }
// });

// rapid
//   .query({
//     "query users": {}
//   })
//   .then(res => {
//     console.log(res);
//   });

// rapid
//   .query({
//     "read users": {
//       $group: [
//         {
//           $group: {
//             _id: "$lastname",
//             age: { $min: "$age" },
//             maxage: { $max: "$age" },
//             num: { $sum: 1 }
//           }
//         }
//       ]
//     }
//   })
//   .then(res => {
//     console.log(res);
//   });