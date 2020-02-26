# RapidQuery

#### Ver 0.1a

## Content
### [Intro](#1-intro)
### [Installation](#2-installation)
### [Usage](#3-Usage)
### [定义Model](#4-define-a-model)
* #### [数据类型](#4-1-date-types)
* #### [数据验证](#4-2-validation)
* #### [选项](#4-3-model-options)
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
  "read users":{
    id: 1
  }
}
```
至
```key
http://localhost:8080/rapidql
```
就可以查询到数据
```key
{
  users: [{
    id: 1,
    name: "tt",
    age : 29,
    gender: "male"
  }]
}
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
  host: "mongodb://localhost:27017/rapid",
  api: "/rapidquery" //可以省略，默认为"/rapidquery"
});
```
或使用用户名和密码
```key
var rapid = new RapidQuery({
    host: "mongodb://admin:12345678@localhost:27017/rapid?authSource=admin"
});
```

在Express下使用GET
```key
app.use("/rapidquery", rapid.middleware.express);
```

在Express下使用POST
```key
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);
app.use("/rapidquery", rapid.middleware.express);
```

在Koa2下使用POST
```key
app.use(rapid.middleware.koa);
```

直接使用
```key
rapid.query(ctx.request.body.query)
```

---

## 4-Define a Model
## 定义 Model

定义一个超简单的 Model
```key
var users = rapid.define({
  name: "users",
  description: "用户数据",
  fields: {
    name: String,
    email: String,
    gender: String,
    age: Number
  }
})
```

系统会自动添加以下字段
```key
_id
meta:{
  createdAt
  updatedAt
}
```

来定义一个较完整功能的
```key
var users = rapid.define({
  name: "users",
  description: "用户数据",
  fields: {
    id: {
      type: rapid.ObjectId,
      default: rapid.newObjectId() //rapid.newObjectId()可以生成一段新的id
    },
    firstname: String,
    lastname: String,
    email: {
      type: String,
      unique: true,
      lowercase: true, 
      trim: true,
      required: [true, "Email为必填项"],  //required说明该field不能为空
      
      //自定义验证
      validate: {
        validator: value => {   
          return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(
            value
          );
        },
        message: "{VALUE} 不是一个有效的Email地址!"
      }
    },
    userType:{
      type: String,
      default: "学生",
      enum:["学生","老师"]
    },
    age: {
      type: Number,
      //数值验证, 最小值为15, 最大值为30
      min: 15,
      max: [30, "年龄不能超过30岁"]
    },
    job:{
      type: String,
      required: function() {
        return this.age > 23; //required可变, 比如当age大于23岁时, job才是必填项
      }
    },
    school: {
      name: String
    }
  },
  options: {
    timestamp: true, //可以不填，默认为true, model会自动添加 meta: {createdAt, updatedAt}
    paranoid: true, //可以不填，默认为true, 当使用delete时, 使用逻辑删除（并不真正删除）
    discriminatorKey: "kind"
  }
});
```

### 4-1-Date Types
### 数据类型

所有可用的数据类型
```key
String
Number
Date
Buffer
Boolean
Mixed      // 一个啥都可以放的 SchemaType ， 虽然便利，但也会让数据难以维护。
ObjectId   // 要指定类型为 ObjectId，在声明中使用 rapid.ObjectId。
Array
Decimal128
```

所有可用的选项
```key
所有类型相关
required: 布尔值或函数 如果值为真，为此属性添加 required 验证器
default: 任何值或函数 设置此路径默认值。如果是函数，函数返回值为默认值
validate: 函数，自定义验证
get: 函数 使用 Object.defineProperty() 定义自定义 getter
set: 函数 使用 Object.defineProperty() 定义自定义 setter
alias: 字符串 仅mongoose >= 4.10.0。 为该字段路径定义虚拟值 gets/sets

索引相关
index: 布尔值 是否对这个属性创建索引
unique: 布尔值 是否对这个属性创建唯一索引
sparse: 布尔值 是否对这个属性创建稀疏索引

String相关
lowercase: 布尔值 是否在保存前对此值调用 .toLowerCase()
uppercase: 布尔值 是否在保存前对此值调用 .toUpperCase()
trim: 布尔值 是否在保存前对此值调用 .trim()
match: 正则表达式 创建验证器检查这个值是否匹配给定正则表达式
enum: 数组 创建验证器检查这个值是否包含于给定数组

Number相关
min: 数值 创建验证器检查属性是否大于或等于该值
max: 数值 创建验证器检查属性是否小于或等于该值

Date相关
min: Date 创建验证器检查属性是否大于或等于该Date
max: Date 创建验证器检查属性是否小于或等于该Date
```

因 ORM 部分采用的是 Mongoose 的代码，数据类型的详细说明, 请访问: http://www.mongoosejs.net/docs/schematypes.html

### 4-2-Validation
### 数据验证

```key
validate: {
  validator: (v) => {
    return /\d{3}-\d{3}-\d{4}/.test(v);
  },
  message: '{VALUE} is not a valid phone number!'
},
```

自定义检验器可以是异步的
```key
validate: (v) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(false);
    }, 5);
  });
}
```

因 ORM 部分采用的是 Mongoose 的代码，关于验证的详细说明, 请访问: http://www.mongoosejs.net/docs/validation.html

### 4-3-Model Options
### 选项

```key
timestamp: true   // 默认为true, model会自动添加 meta: {createdAt, updatedAt}
paranoid: true    // 默认为true, 当使用delete时, 使用逻辑删除（并不真正删除）,删除时添加deletedAt
```
---

<br />

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
{
  users:[
    {
      _id: 5e4b97490cc84609513cf8fa,
      firstname: 'tt',
      lastname: 'zhang',
      age: 29,
      school: { name: 'UCLA' },
      __v: 0
    }
  ]
}
```

查询所有Users
```keys
{
  "read users": {
  }
}
```

### 并行查询

查询名为"tt"的user和"alice"的student<br />
注意：查询为并行，所以不能有先后顺序。

```keys
{
  "read users": {
    firstname: "tt"
  },
  "read students": {
    name: "alice"
  }
}
```

结果:
```keys
{
  users:[
    {...}
  ],
  students:[
    {...}
  ]
}
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

或者使用 "-" 排除字段
```key
{
  "read users": {
    $select:"-firstname -age"
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
{
  update_users: { n: 1, nModified: 1, ok: 1 }
}
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

## 9-Notes
## 说明

### 9-1-Returns
### 返回结果

***为Collection名
```keys
{
  create_***:{},
  ***:[],
  update_***:{},
  delete_***:{},
}
```