# RapidQuery

#### Ver 0.1a

## Content
### [Intro](#1-intro)
### [Installation](#2-installation)
### [Usage](#3-Usage)
### [定义Model](#4-define-a-model)
### [创建Document](#5-create-a-document)
### [查询Document](#6-query-documents)
* #### [查询](#6-1-read)
* #### [使用 比较运算符](#6-2-comparison-operatiors)
* #### [使用 逻辑运算符](#6-3-logical-operators)
* #### [使用 正则表达式 进行 模糊查询](#6-4-regular-expression)
* #### [排序](#6-5-order)
* #### [pageSize 和 pageNum](#6-6-pagesize-and-pagenum)
* #### [过滤查询字段](#6-7-select)
* #### [In和NotIn](#6-8-in-or-notin)
* #### [计数](#6-9-count)
### [更改Document](#7-update-document)
* #### [更改](#7-1-update)
* #### [将数值添加到数组](#7-2-push)
### [删除Document](#8-delete-document)

----

## 1-Intro

一种使用JSON来查询API的接口协议，前端只需要GET/POST发送JSON到一个地址（比如下面这个API地址），就可以与MongoDB数据库进行CRUD。

比如Post/Get 下面这个JSON, 参数名为 "query"  ：
```key
{
  "read user":{
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

关于Model的验证, 请访问: http://www.mongoosejs.net/docs/validation.html
<br />更多的数据类型, 请访问: http://www.mongoosejs.net/docs/schematypes.html
```key
var users = rapid.define({
  name: "users",
  description: "用户数据",
  fields: {
    firstname: String,
    lastname: String,
    email: {
      type: String,
      unique: true,
      required: [true, "Email为必填项"],
      validate: {
        validator: value => {
          return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(
            value
          );
        },
        message: "{VALUE} 不是一个有效的Email地址!"
      }
    },
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


## 6-Read documents
## 查询 Document

### 6-1-Read
查询名为"tt"的user
```keys
{
  "read users": {
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

查询所有Users
```keys
{
  "read users": {
  }
}
```

<br />

### 6-2-Comparison Operatiors 
### 使用 <b>比较运算符</b> 

```keys
{
  "read users": {
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
$gte: greater than equal   大于等于
$lte: less than equal      小于等于
$ne: not equal       不等于
```

<br />

### 6-3-Logical Operators 
### 使用 <b>逻辑运算符</b> 

```keys
{
  "read users": {
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
  "read users": {
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
  "read users": {
    $order:{
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
  "read users": {
    firstname: /t/,
    $pageSize: 1,
    $pageNum: 1
  }
}
```
<br />

### 6-7-Select
### 过滤查询字段
  
$select可以选择只要查询的字段

```key
{
  "read users": {
    $select:"firstname age school.name"
  }
}
```
<br />

### 6-8-In or NotIn
### 使用 <b>In 和 NotIn</b> 

$in:

```keys
{
  "read users": {
    "school.name": {
      $in: ["MIT"]
    }
  }
}
```

$nin:
```keys
{
  "read users": {
    "school.name": {
      $nin: ["UCLA"]
    }
  }
}
```
<br />

### 6-9-Count
### 计数 

使用 $count 计算学校名为MIT用户数量
```keys
{
  "read users": {
    "school.name": {
      $in: ["MIT"]
    },
    $count: 1
  }
}
```

---
<br />

## 7-Update Document
## 更改 Document

### 7-1-Update

更新名字为 "tt" 的用户的年龄为 35<br />

```keys
{
  "update users": {
    age: 35,
    $update:{
      firstname: "tt"
    }
  }
}
```

结果:
```keys
{ n: 1, nModified: 1, ok: 1 }
```
<br />

### 7-2-Push
### 将数值添加到数组

更改名字为 "tt" 的用户<br />

首先，将Users表添加一个新的数组字段Cars
```key
rapid.define({
  model: "users",
  description: "This is an user collection",
  schema: {
    firstname: String,
    lastname: String,
    age: Number,
    cars: Array,
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

```key
{
  "update users": {
    firstname: "tt",
    $update:{
      $push: {
        cars: ["porsche", "ford f-150"]
      }
    }
  }
}
```
<br />

### 7-3-Inc
### 增加某个数值

更改名字为 "tt" 的用户，age+1<br />
```key
{
  "update users": {
    firstname: "tt",
    $update:{
      $inc:{
        age:1
      }
    }
  }
}
```

---

<br />

## 8-Delete Document
## 删除 Document

删除年龄为35的一个用户. <br />
```keys
{
  "delete users": {
    age: 35
  }
}
```