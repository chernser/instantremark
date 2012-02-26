(function() {
  var DbObjectID, LOG, Recaptcha, app, assignShortLink, config, db, express, isValidUrl, jade, logger, mongo, publicPath, stylus, urlshortener, util, validateCaptcha, validateRemark, _;

  express = require("express");

  config = {
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
    }
  };

  app = express.createServer();

  urlshortener = require("./urlshortener");

  stylus = require("stylus");

  jade = require("jade");

  _ = require("underscore");

  util = require("util");

  logger = require("./logger");

  LOG = new logger.Logger("InstatRemark.server");

  publicPath = __dirname + '/public/';

  LOG.info("Public dir path: " + publicPath);

  app.configure(function() {
    var stylusConf;
    app.set('view options', {
      layout: false,
      pretty: true
    });
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    stylusConf = {
      src: __dirname + '/stylus/',
      dest: publicPath
    };
    app.use(stylus.middleware(stylusConf));
    return app.use(express.static(publicPath));
  });

  app.configure('production', function() {
    LOG.info('Configuring for production');
    config.server.domain = "inremark.com";
    config.captcha.service.publicKey = "6LeZLM4SAAAAAH7JZKoA5EbfkjNUFbLhNjFf55cV";
    return config.captcha.service.privateKey = "6LeZLM4SAAAAAD6l91xsRu1i4vr8pAJ7LFcfDRMC";
  });

  app.configure('development', function() {
    LOG.info('Configuring for development');
    config.server.domain = "localhost";
    config.captcha.service.publicKey = "6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7";
    return config.captcha.service.privateKey = "6Lf6I84SAAAAAG6FrCqB1-q8WGzo0WrBdnS_E-Bq";
  });

  mongo = require("mongodb");

  db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {});

  db.open(function() {
    return LOG.info('Connection with DB - OK');
  });

  app.get('/', function(req, res) {
    return res.render('index', {});
  });

  Recaptcha = require("recaptcha").Recaptcha;

  app.get('/captcha.js', function(req, res) {
    var html, publicKey;
    publicKey = config.captcha.service.publicKey;
    html = util.format("var RecaptchaPublicKey = \"%s\";", publicKey);
    return res.send(html, {
      'Content-Type': 'text/javascript'
    });
  });

  DbObjectID = mongo.ObjectID;

  app.get('/remark/:id', function(req, res) {
    var remarkId;
    try {
      remarkId = new DbObjectID.createFromHexString(req.params.id);
    } catch (ex) {
      LOG.warn('Failed to conver remark id: ' + req.params.id, 'get:remark');
      res.send(400);
      return;
    }
    return db.collection("remark", function(err, collection) {
      return collection.find({
        '_id': remarkId
      }, function(err, cursor) {
        if (err !== null) {
          LOG.warn('Error occured while searching remark with id: ' + remarkId, 'get:remark');
          res.send(500);
          return;
        }
        return cursor.nextObject(function(err, obj) {
          if (obj !== null) {
            return res.json(obj);
          } else {
            LOG.warn('No remark with id ' + remarkId + ' was found', 'get:remark');
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
    var data, privKey, pubKey, recaptcha;
    data = {
      remoteip: req.connection.remoteAddress,
      challenge: req.body.recaptcha_challenge_field,
      response: req.body.recaptcha_response_field
    };
    pubKey = config.captcha.service.publicKey;
    privKey = config.captcha.service.privateKey;
    recaptcha = new Recaptcha(pubKey, privKey, data);
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
          console.log("remark is valid");
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

  LOG.info("Going to listen on port: " + config.server.port);

  app.listen(config.server.port);

}).call(this);
