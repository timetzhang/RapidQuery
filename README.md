# RapidQuery

#### Ver 0.1a

## Content
### <a href="#1">1. Intro</a>
### <a href="#2">2. Installation</a>
### <a href="#3">3. Usage</a>
### <a href="#4">4. 定义Model</a>
### <a href="#5">5. 创建Document</a>
### <a href="#6">6. 查询Document</a>
* #### <a href="#6-1">查询</a>
* #### <a href="#6-2">使用 比较运算符</a>
* #### <a href="#6-3">使用 逻辑运算符</a>
* #### <a href="#6-4">使用 正则表达式 进行 模糊查询</a>
* #### <a href="#6-4">排序</a>


### <a href="#7">7. 更改Document</a>
### <a href="#8">8. 删除Document</a>
<br />

##  1. Intro <a id="1"></a>

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
<br />

## 2. Installation <a id="2"></a>
```key
npm install --save rapidquery
```

或使用淘宝镜像
```key
cnpm install --save rapidquery
```
<br />

## 3. Usage <a id="3"></a>

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
<br />

## 4. 定义 Model <a id="4"></a>

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
<br />

## 5. 创建 Document <a id="5"></a>

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

<br />

## 6. 查询 Document <a id="6"></a>

* 查询名字叫tt的用户 <a id="6-1"></a>
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
* 使用 <b>比较运算符</b><a id="6-2"></a><br /> 

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

* 使用 <b>逻辑运算符</b> <a id="6-3"></a>

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

* 使用 正则表达式 进行 <b>模糊查询</b><a id="6-4"></a> 

```keys
{
  "query users": {
    firstname: /t/
  }
}
```
<br />

* <b>排序</b><a id="6-5"></a> 
<br />
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

## 7. 更改 Document <a id="7"></a>

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
<br />

## 8. 删除 Document <a id="8"></a>

删除年龄为35的一个用户. <br />
注册 "age" 前面的 "\*", 表示查询条件.
```keys
{
  "delete users": {
    "*age": 35
  }
}
```