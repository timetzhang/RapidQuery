const RapidQuery = require("../rapidquery");

RapidQuery.connect({
    host: "mongodb://admin:cl3bkm4fuc@localhost:27017/oiart?authSource=admin"
});

RapidQuery.define({
    name: "artists",
    description: "artists",
    fields: {
        name: {
            type: String,
            require: true
        },
        image: Array,
        position: String,
        profession: String,
        team: String
    }
})

RapidQuery.define({
    name: "works",
    description: "works",
    fields: {
        name: {
            type: String,
            require: true,
            trim: true
        },
        artists: Array,
        exhibition: String,
        details: String,
        video: String,
        image: String,
        keywords: Array,
        type: {
            type: String,
            enum: ["finished", "working"]
        }
    }
})

RapidQuery.define({
    name: "wikis",
    description: "wikis",
    fields: {
        name: {
            type: String,
            require: true,
            unique: true
        },
        user: String,
        images: Array,
        videos: Array,
        details: String,
        clicks: String,
        relatedLinks: Array,
        type: {
            type: String,
            enum: ["维基", "新闻", "成员", "作品"]
        },
        spec: RapidQuery.Mixed
    }
})

RapidQuery.query(`
    {
        "read artists":{}
    }
`).then(r => {
    console.log(r)
    r.artists.forEach(element => {
        var q = `{
                "update wikis":{
                    name: "${element.name}",
                    $update:{
                        type:"成员",
                        images:["${element.image}"],
                        spec:{
                            "position" : "${element.position}",
                            "profession" : "${element.profession}",
                            "team" : "${element.team}"
                        }
                    }
                }
            }`
        RapidQuery.query(q).then(res => {
            console.log(res)
        })
    });
})

// RapidQuery.query(`{"update wikis":{
//     type: "news",
//     $update: {
//         type: "新闻"
//     }
//   }}`).then(r => {
//     console.log(r)
// })