var url = require('url');
    connect = require("connect"),
    mongodb = require("mongodb"),
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
    var item = "",
        urlID = 0,
        maxAge = 0,
        urlData = {},
        myString = "",
        chars = "abcdefghijklmnopqrstuvwxyz";

    function checkForInsertError(response) {
        if (response instanceof Error) {
            response.message = "db insert error";
            return next (response);
        } else {
            res.end("Data inserted " + response.insertedIds);
        }
    }

    function checkForFindError(response) {
        if (response instanceof Error && !response.redo) {
            response.message = "db find error";
            return next (response);
        } else if (response.redo) {
            console.log("Cache miss");
            maxAge = +new Date() + 10000;
            for(var i = 0;i < Math.random() * 10; i++) {
                myString += chars[Math.floor(Math.random() * chars.length)];
            }
            MongoInstance.insert({
                data: myString,
                ttl: maxAge
            },
            checkForInsertError);

        } else {
            console.log("Cache hit");
            res.end(JSON.stringify(response));
        }
    }

    switch(req.method) {
        case "POST" :
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

        case "GET" :
            urlData = url.parse(req.url);
            urlID = urlData.path.slice(1);

            MongoInstance.find(urlID, checkForFindError);
            break;
    }
}

connect()
    .use(setUpDB)
    .use(simpleRouter)
    .use(function (err, req, res, next) {
    console.dir(err);
        res.statusCode = 500;
        res.end('server error');
    }).listen(3000);
