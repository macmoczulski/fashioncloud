'use strict'

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    //simple js singielton
    instance = null,
    MongoDB = function() {
        if (instance) {
            return instance;
        } else {
            instance = this;
        }
    };

MongoDB.prototype.init = function(options, callback) {
    var url = 'mongodb://127.0.0.1:27017/cache',
        self = this;

    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err);
        } else {
            self.collectionDB = db.collection('cache');
            self.connectionDB = db;
            callback();
            console.log('Connection established ok', url);
        }
    });
}

MongoDB.prototype.insert = function(data, callback) {
    var self = this;

    self.collectionDB.insert(data, {save: true}, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(result);
        }
    });
}

MongoDB.prototype.find = function(data, callback) {
    var query = {},
        self = this,
        err = new Error();

    if (data && data.length !== 24) {
        err.redo = true;
        callback(err);
    } else {
        query = data ? {"_id": new mongodb.ObjectId(data)} : {};

        self.collectionDB.find(query).toArray(function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(result);
            }
        });
    }
}

module.exports = MongoDB;
