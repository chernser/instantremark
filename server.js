(function() {
  var DbObjectID, Recaptcha, app, assignShortLink, config, db, express, isValidUrl, mongo, publicPath, recaptchaPrivateKey, recaptchaPublicKey, stylus, urlshortener, validateCaptcha, validateRemark, _;

  express = require("express");

  config = {
    maxRemarkLen: 640000,
    server: {
      domain: "localhost",
      port: 4000
    }
  };

  app = express.createServer();

  urlshortener = require("./urlshortener");

  stylus = require("stylus");

  _ = require("underscore");

  publicPath = __dirname + '/public/';

  app.configure(function() {
    var stylusConf;
    app.set('view options', {
      layout: false,
      pretty: true
    });
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    stylusConf = {
      src: __dirname + '/stylus/',
      dest: publicPath
    };
    app.use(stylus.middleware(stylusConf));
    return app.use(express.static(publicPath));
  });

  mongo = require("mongodb");

  db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {});

  db.open(function() {});

  app.get('/', function(req, res) {
    return res.render('index', {});
  });

  recaptchaPublicKey = "6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7";

  recaptchaPrivateKey = "6Lf6I84SAAAAAG6FrCqB1-q8WGzo0WrBdnS_E-Bq";

  Recaptcha = require("recaptcha").Recaptcha;

  app.get('/captcha', function(req, res) {
    return res.send(recaptchaInst.toHTML());
  });

  DbObjectID = mongo.ObjectID;

  app.get('/remark/:id', function(req, res) {
    var remarkId;
    try {
      remarkId = new DbObjectID.createFromHexString(req.params.id);
    } catch (ex) {
      res.send(400);
      return;
    }
    return db.collection("remark", function(err, collection) {
      return collection.find({
        '_id': remarkId
      }, function(err, cursor) {
        return cursor.nextObject(function(err, obj) {
          if (obj !== null) {
            return res.json(obj);
          } else {
            return res.send(404);
          }
        });
      });
    });
  });

  isValidUrl = function(url) {
    return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
  };

  validateRemark = function(remark) {
    var bytes;
    bytes = 0;
    if (!_.isUndefined(remark.link)) {
      _.each(remark.links, function(link, index) {});
    }
    if (!_.isUndefined(remark.note)) bytes += remark.note.length;
    if (bytes > config.maxRemarkLen) {
      throw {
        error: 1,
        desc: "Remark total size should be &le; " + config.maxRemarkLen
      };
    }
    if (bytes === 0) {
      throw {
        error: 2,
        desc: "We do not store empty remarks"
      };
    }
  };

  validateCaptcha = function(req, callback) {
    var data, recaptcha;
    data = {
      remoteip: req.connection.remoteAddress,
      challenge: req.body.recaptcha_challenge_field,
      response: req.body.recaptcha_response_field
    };
    recaptcha = new Recaptcha(recaptchaPublicKey, recaptchaPrivateKey, data);
    return recaptcha.verify(callback);
  };

  app.post('/remark/', function(req, res) {
    return validateCaptcha(req, function(success, error) {
      var remark;
      if (!success) {
        res.send({
          error: 3,
          desc: "Invalid captcha. Try again, please"
        }, 400);
        return;
      }
      if (req.is('*/json')) {
        remark = req.body;
        try {
          validateRemark(remark);
          return db.collection("remark", function(err, collection) {
            return collection.insert(remark, function(err, objects) {
              return res.json(_.first(objects));
            });
          });
        } catch (e) {
          console.log(e);
          return res.send(e, 400);
        }
      }
    });
  });

  app.put('/remark', function(req, res) {
    return res.send(405);
  });

  assignShortLink = function(remark, res) {
    var link;
    if (_.isUndefined(remark.shortLink)) {
      link = "http://" + config.server.domain + ":" + config.server.port + "/#remark/" + remark._id;
      console.log("requesting short link for: " + link);
      return urlshortener.makeShort(link, function(shortLink, err) {
        if (shortLink !== null) {
          console.log(shortLink);
          remark.shortLink = shortLink;
          res.send(remark);
          db.collection("remark", function(err, collection) {
            return collection.save(remark);
          });
          return;
        }
        console.log("error occure");
        if (err !== null) return console.log(err);
      });
    } else {
      console.log("short link exists");
      return res.send(remark);
    }
  };

  app.post('/remark/:id/shortlink', function(req, res) {
    var remarkId;
    try {
      remarkId = new DbObjectID.createFromHexString(req.params.id);
    } catch (ex) {
      res.send(400);
      return;
    }
    return db.collection("remark", function(err, collection) {
      return collection.find({
        '_id': remarkId
      }, function(err, cursor) {
        return cursor.nextObject(function(err, obj) {
          if (obj === null) res.send(404);
          return assignShortLink(obj, res);
        });
      });
    });
  });

  app.listen(config.server.port);

}).call(this);
