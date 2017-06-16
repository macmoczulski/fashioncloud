var url = require('url');
    connect = require("connect"),
    mongodb = require("mongodb"),
    api = require("./../lib/api"),
    MongoInstance = new(require("./../lib/mongoDBWrap"));


function setUpDB(req, res, next) {
    function checkForError(error) {
        if (error instanceof Error) {
            error.message = "db connection error";
            next (error);
        } else {
            next();
        }
    }
    MongoInstance.init(null, checkForError);
}

function simpleRouter(req, res, next) {
    function checkForInsertError(response) {
        if (response instanceof Error) {
            response.message = "db insert error";
            next (response);
        } else {
            res.end("Data inserted " + response.insertedIds);
        }
    }
    switch(req.method) {
        case "POST" :
            var item = "",
                maxAge = 0;
            req.setEncoding("utf8"); //change encoding
            req.on("data", function(chunk) {
                item = item + chunk;
            });
            req.on("end", function() {
                maxAge = +new Date() + 10000;
                MongoInstance.insert({
                    data: item,
                    ttl: maxAge
                },
                checkForInsertError);
            });
            break;
    }
}

connect()
    .use(setUpDB)
    .use(simpleRouter)
    .use(function (err, req, res) {
        res.statusCode = 500;
        res.end('server error');
    }).listen(3000);
