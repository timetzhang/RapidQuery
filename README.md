# RapidQuery

#### Ver 0.1a

## Content
### [1. Intro](#intro)
### [2. Installation](#installation)
### [3. Usage](#usage)
### [4. 定义Model](#%e5%ae%9a%e4%b9%89-model)
### [5. 创建Document](#%e5%88%9b%e5%bb%ba-document)
### [6. 查询Document](#%e6%9f%a5%e8%af%a2-document)
* #### [查询](#query)
* #### [使用 比较运算符](###comparison-operatiors-%e4%bd%bf%e7%94%a8-b%e6%af%94%e8%be%83%e8%bf%90%e7%ae%97%e7%ac%a6b)
* #### [使用 逻辑运算符](#logical-operators-%e4%bd%bf%e7%94%a8-b%e9%80%bb%e8%be%91%e8%bf%90%e7%ae%97%e7%ac%a6b)
* #### [使用 正则表达式 进行 模糊查询](#regular-expression-%e4%bd%bf%e7%94%a8-%e6%ad%a3%e5%88%99%e8%a1%a8%e8%be%be%e5%bc%8f-%e8%bf%9b%e8%a1%8c-b%e6%a8%a1%e7%b3%8a%e6%9f%a5%e8%af%a2b)
* #### [排序](#order-b%e6%8e%92%e5%ba%8fb)
* #### [pageSize 和 pageNum](#pagesize-%e5%92%8c-pagenum)
### [7. 更改Document](#%e6%9b%b4%e6%94%b9-update-document)
### [8. 删除Document](#%e5%88%a0%e9%99%a4-delete-document)

----

##  Intro



一种使用JSON来查询API的接口协议，前端只需要GET/POST发送JSON到一个地址（比如下面这个API地址），就可以与MongoDB数据库进行CRUD。

比如Post/Get下面这个JSON ：
```key
{
  "query user":{
    _id: 1
  }
}
```
至
```key
http://localhost:8080/rapidql
```
就可以查询到数据
```key
[{
  _id: 1,
  name: "tt",
  age : 29,
  gender: "male"
}]
```
---

## Installation
```key
npm install --save rapidquery
```

或使用淘宝镜像
```key
cnpm install --save rapidquery
```

---

## Usage

```key
const RapidQuery = require("rapidquery");

var rapid = new RapidQuery({
  url: "mongodb://localhost:27017/rapid"
});
```
或使用用户名和密码
```key
var rapid = new RapidQuery({
  url: "mongodb://username:password@localhost:27017/databasename"
});
```

在Express下使用GET
```key
app.use("/rapidquery", rapid.expressMiddleware);
```

在Express下使用POST
```key
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);
app.use("/rapidquery", rapid.expressMiddleware);
```

---

## 定义 Model

for more schema define, please visit: https://mongoosejs.com/docs/guide.html
<br />for more Datatypes, please visit: https://mongoosejs.com/docs/schematypes.html
```key
rapid.define({
  model: "users",
  description: "This is an user collection",
  schema: {
    firstname: String,
    lastname: String,
    age: Number,
    cellphone:{
      type: String,
      unique: true
    }
    school: {
      name: String
    }
  }
});
```

---


## 创建 Document

使用GET方法:
```key
http://localhost:8080/rapidquery?query={"create user":{"firstname":"tt"}}
```

使用POST方法（参数为query）

```key
{
  "create users": {
    firstname: "tt",
    lastname: "zhang",
    age: 29,
    school: {
      name: "UCLA"
    }
  }
}
```
创建多个documents
```key
{
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
}
```

---


## 查询 Document

### Query
```keys
{
  "query users": {
    firstname: "tt"
  }
}
```

结果:
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
<br />

### Comparison Operatiors 使用 <b>比较运算符</b> 

```keys
{
  "query users": {
    age: {
      $lt: 25
    }
  }
}
```

结果:
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
还有其他比较运算符可以使用.
```key
$gt: greater than    大于
$lt: less than       小于
$ge: greater equal   大于等于
$le: less equal      小于等于
$ne: not equal       不等于
```

<br />

### Logical Operators 使用 <b>逻辑运算符</b> 

```keys
{
  "query users": {
    $or:[
      {age: 21},
      {age: 23}
    ]
  }
}
```

<br />

### Regular Expression 使用 正则表达式 进行 <b>模糊查询</b>

```key
{
  "query users": {
    firstname: /t/
  }
}
```
<br />

### Order <b>排序</b>

按年龄进行倒序
```keys
{
  "query users": {
    order:{
      age: -1
    }
  }
}
```
<br />

### PageSize 和 PageNum
  
pageSize来控制每页返回数据的行数，pageNum来控制第几页

注意：pageNum从1开始，而不是0

```key
{
  "query users": {
    firstname: /t/,
    pageSize: 1,
    pageNum: 1
  }
}
```

---

## 更改 Update Document

更新名字为 "tt" 的用户的年龄为 35<br />
注意：使用 "firstname" 前面有个 <b>"\*"</b>, 表示查询条件.
```keys
{
  "update users": {
    "*firstname": "tt",
    age: 35
  }
}
```

结果:
```keys
{ n: 1, nModified: 1, ok: 1 }
```

---


## 删除 Delete Document

删除年龄为35的一个用户. <br />
注册 "age" 前面的 "\*", 表示查询条件.
```keys
{
  "delete users": {
    "*age": 35
  }
}
```