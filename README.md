# RapidQuery

#### Ver 0.1a

## Content
### [Intro](#1-intro)
### [Installation](#2-installation)
### [Usage](#3-Usage)
### [定义Model](#4-define-a-model)
### [创建Document](#5-create-a-document)
### [查询Document](#6-query-documents)
* #### [查询](#6-1-query)
* #### [使用 比较运算符](#6-2-comparison-operatiors)
* #### [使用 逻辑运算符](#6-3-logical-operators)
* #### [使用 正则表达式 进行 模糊查询](#6-4-regular-expression)
* #### [排序](#6-5-order)
* #### [pageSize 和 pageNum](#6-6-pagesize-and-pagenum)
### [更改Document](#7-update-document)
### [删除Document](#8-delete-document)

----

## 1-Intro

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

## 2-Installation
```key
npm install --save rapidquery
```

或使用淘宝镜像
```key
cnpm install --save rapidquery
```

---

## 3-Usage

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

## 4-Define a Model
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



## 5-Create a document
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
### 创建多个documents
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


## 6-Query documents
## 查询 Document

### 6-1-Query
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

### 6-2-Comparison Operatiors 
### 使用 <b>比较运算符</b> 

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

### 6-3-Logical Operators 
### 使用 <b>逻辑运算符</b> 

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

### 6-4-Regular Expression 
### 使用 正则表达式 进行 <b>模糊查询</b>

```key
{
  "query users": {
    firstname: /t/
  }
}
```
<br />

### 6-5-Order 
### <b>排序</b>

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

### 6-6-PageSize and PageNum
  
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

## 7-Update Document
## 更改 Document

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


## 8-Delete Document
## 删除 Document

删除年龄为35的一个用户. <br />
注册 "age" 前面的 "\*", 表示查询条件.
```keys
{
  "delete users": {
    "*age": 35
  }
}
```