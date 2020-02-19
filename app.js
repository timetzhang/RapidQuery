const RapidQuery = require("./rapidquery");
var rapid = new RapidQuery({
  url: "mongodb://localhost:27017/rapid"
});

rapid.define({
  model: "users",
  description: "This is an user collection",
  schema: {
    firstname: String,
    lastname: String,
    age: Number,
    alias: Array,
    school: {
      name: String
    }
  }
});

// rapid.query({
//   "create users": [
//     {
//       firstname: "timet",
//       lastname: "zhang",
//       age: 29,
//       school: {
//         name: "UCLA"
//       }
//     },
//     {
//       firstname: "jinchuang",
//       lastname: "huang",
//       age: 21,
//       school: {
//         name: "MIT"
//       }
//     }
//   ]
// });

// rapid.query({
//   "query users": {
//     firstname: "timet"
//   }
// });

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

rapid
  .query({
    "update users": {
      age: 35,
      $update: {
        firstname: "tt"
      }
    }
  })
  .then(res => {
    console.log(res);
  });
