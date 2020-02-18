# Rapid QL

### Ver 0.1a

an API protocol with json style to CRUD mongdo database. use only one post api url. such as:

```key
http://localhost:8080/rapidql
```

## Usage

```key
const RapidQL = require("./rapidql");

var rapid = new RapidQL({
  url: "mongodb://localhost:27017/rapid"
});
```

## Define a new collection
```key
rapid.define({
  model: "users",
  description: "This is an user collection",
  schema: {
    firstname: String,
    lastname: String,
    age: Number,
    school: {
      name: String
    }
  }
});
```

## Create a document
```key
rapid.query({
  "create users": {
    firstname: "tt",
    lastname: "zhang",
    age: 29,
    school: {
      name: "UCLA"
    }
  }
});
```

## Create documents
```key
rapid.query({
  "create users": [
    {
      firstname: "tt",
      lastname: "zhang",
      age: 29,
      school: {
        name: "UCLA"
      }
    },
    {
      firstname: "jinchuang",
      lastname: "huang",
      age: 21,
      school: {
        name: "MIT"
      }
    }
  ]
});
```

## Query a document

Query a document with a <b>fixed string</b>
```keys
rapid.query({
  "query users": {
    firstname: "tt"
  }
});
```

result:
```keys
[
  {
    _id: 5e4b97490cc84609513cf8fa,
    firstname: 'tt',
    lastname: 'zhang',
    age: 29,
    school: { name: 'UCLA' },
    __v: 0
  }
]
```


Query a document with <b>comparison operator</b>
```keys
rapid.query({
  "query users": {
    age: {
      $lt: 25
    }
  }
});
```

result:
```keys
[
  {
    school: { name: 'MIT' },
    _id: 5e4b9a5e2b6efc110df51fe2,
    firstname: 'jinchuang',
    lastname: 'huang',
    age: 21,
    __v: 0
  }
]
```

Query a document with <b>logical operators</b>
```keys
rapid.query({
  "query users": {
    $or:[
      {age: 21},
      {age: 23}
    ]
  }
});
```

result:
```keys
[
  {
    school: { name: 'MIT' },
    _id: 5e4b9a5e2b6efc110df51fe2,
    firstname: 'jinchuang',
    lastname: 'huang',
    age: 21,
    __v: 0
  }
]
```

## Update a document
update the document where the firstname is tt. <br />
using "*" before "firstname".
```keys
rapid.query({
  "update users": {
    "*firstname": "tt",
    age: 35
  }
});
```

result:
```keys
{ n: 1, nModified: 1, ok: 1 }
```

## Delete a document
update the document where the age is 35. <br />
using "*" before "age".
```keys
rapid.query({
  "delete users": {
    "*age": 35
  }
});
```