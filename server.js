/**
 *  Instant remark server entry point
 *
 *
 */



// Configuration
var config = {
    publicPath: __dirname + '/public/',
    maxRemarkLen: 640000,
    server: {
        domain: "localhost",
        port: 4000
    },

    captcha: {
        service: {
            publicKey: "6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7",
            privateKey: "6Lf6I84SAAAAAG6FrCqB1-q8WGzo0WrBdnS_E-Bq"
        }
    },

    isProduction: false
};

// Imports needed for startup
var events = require('events');
var _ = require('underscore');
var express = require('express');
var mongoDb = require('mongodb');

// Application
var application = new events.EventEmitter();

application.state = {
    'db.ready' : false,
    //'log.ready': false,

    setBitReady: function (bit) {
        if (!_.isUndefined(bit)) {
            this[bit] = true;

            // check if application ready to run
            var isReady = true;
            for (var bit in this) {
                if (!_.isBoolean(this[bit]))
                    continue;
                if (this[bit] == false) {
                    isReady = false;
                    break;
                }
            }

            if (isReady)
                application.onReady();
        }
    }
};


// Initializing Express.js application 
application.expressApp = express.createServer();

application.expressApp.configure (function() {
    var app = application.expressApp;

    require('jade');
    app.set('view options', {layout: false, pretty: true});
    app.set('view engine', 'jade');
    app.use(express.bodyParser());

    var stylusConf = {
        src: __dirname + '/stylus/',
        dest: config.publicPath // TODO: check this https://github.com/LearnBoost/stylus/issues/486
    };

    var stylus = require('stylus');
    app.use(stylus.middleware(stylusConf));

    // Should be after stylus middleare
    app.use(express.static(config.publicPath));
});

application.expressApp.configure('production', function() {
    config.server.domain = "inremark.com";

    config.captcha.service.publicKey = "6LeZLM4SAAAAAH7JZKoA5EbfkjNUFbLhNjFf55cV";
    config.captcha.service.privateKey = "6LeZLM4SAAAAAD6l91xsRu1i4vr8pAJ7LFcfDRMC";

    config.isProduction = true;
});

application.expressApp.configure('development', function() {
    config.server.domain = "localhost";

    config.captcha.service.publicKey = "6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7";
    config.captcha.service.privateKey = "6Lf6I84SAAAAAG6FrCqB1-q8WGzo0WrBdnS_E-Bq";
});


// Initialize DB
application.db = new mongoDb.Db("instantremark",
    new mongoDb.Server('localhost', 27017, {}), {});

application.db.open(function() {
    application.state.setBitReady('db.ready');
});


/// Start listening at the end
application.onReady = function() {
    console.log('application is initialized');
    application.expressApp.listen(4000);
};


/// Logic part (Add route handlers here)
var expressApp = application.expressApp;

expressApp.get('/', function(req, res) {
    res.render('index', {});
});

// create short aliases
var DbObjectID = mongoDb.ObjectID;
var db = application.db;

/**
 * Getting remark by :id
 *
 */
expressApp.get('/remark/:id', function(req, res) {
    var remarkId;
    try {
        remarkId = new DbObjectID.createFromHexString(req.params.id);
    } catch (ex) {
        res.send(400);
        return;
    }

    db.collection('remark', function(err, collection) {
        collection.find({'_id': remarkId}, function(err, cursor) {
            if (err != null) {
                res.send(500);
                return;
            }

            cursor.nextObject(function(err, obj) {
                if (obj != null)
                    res.json(obj);
                else
                    res.send(404);
            });
        });
    });

});

function isValidUrl(url) {
    return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function validateRemark(remark) {
    var bytes = 0;

    if (!_.isUndefined(remark.links)) {
        _.each(remark.links, function(link, index) {
            if (!_.isUndefined(link.link))
                bytes += link.link.length;
            if (!_.isUndefined(link.desc))
                bytes += link.desc.length;
        });
    }

    if (!_.isUndefined(remark.note))
        bytes += remark.note.length;

    if (bytes > config.maxRemarkLen)
        throw {error: 1, desc: "Remark total size should be &le; " + config.maxRemarkLen};

    if (bytes == 0)
        throw {error: 2, desc: "We do not store empty remarks"};
}

/**
 * Create new remark
 */
expressApp.post('/remark/', function(req, res) {
    if (req.is('*/json'))
        remark = req.body
    try {
        validateRemark(remark);
        console.log("remark is valid");
        db.collection("remark", function(err, collection) {
            collection.insert(remark, function(err, objects) {
                res.json(_.first(objects));
            });
        });
    } catch (e) {
        console.log(e);
        res.send(e, 400);
    }
});

/**
 * Handle put request and respond with error because
 * remakr is permanent
 */
expressApp.put('/remark', function(req, res) {
    res.send(405);
});


var urlshortener = require("./urlshortener")

function assignShortLink(remark, res) {

    var link;
    if (_.isUndefined(remark.shortLink)) {
        link = "http://" + config.server.domain;

        if (!config.isProduction)
            link += ":" + config.server.port;
        link += "/#remark/" + remark._id;


        console.log("requesting short link for: " + link);
        urlshortener.makeShort(link, function(shortLink, err) {
            if (shortLink != null) {
                console.log(shortLink);
                remark.shortLink = shortLink;
                res.send(remark);
                db.collection("remark", function(err, collection) {
                    collection.save(remark);
                });
                return;
            }

            console.log("error occure");
            if (err != null)
                console.log(err);
        });
    } else {
        console.log("short link exists");
        res.send(remark);
    }
}

expressApp.post('/remark/:id/shortlink', function(req, res) {
    try {
        remarkId = new DbObjectID.createFromHexString(req.params.id)
    } catch (ex) {
        res.send(400);
        return;
    }

    db.collection('remark', function(err, collection) {
        collection.find({'_id': remarkId}, function(err, cursor) {
            cursor.nextObject(function(err, obj) {
                if (obj == null)
                    res.send(404);
                else
                    assignShortLink(obj, res);
            });
        });
    });
});