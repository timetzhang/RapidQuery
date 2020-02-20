const RapidQuery = require("./rapidquery");
var rapid = new RapidQuery({
  url: "mongodb://localhost:27017/rapid"
});

var users = rapid.define({
  name: "users",
  description: "this is an users model",
  fields: {
    firstname: String,
    lastname: String,
    age: {
      type: Number,
      min: 6,
      max: 12
    },
    alias: Array,
    school: {
      name: String
    }
  },
  options: {
    discriminatorKey: "kind"
  }
});

rapid
  .query({
    "create users": [
      {
        firstname: "timet",
        lastname: "zhang",
        age: 8,
        school: {
          name: "UCLA"
        }
      },
      {
        firstname: "jinchuang",
        lastname: "huang",
        age: 10,
        school: {
          name: "MIT"
        }
      }
    ]
  })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err.message);
  });

rapid
  .query({
    "read users": {
      firstname: "tt"
    }
  })
  .then(res => {
    console.log(res);
  });

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
