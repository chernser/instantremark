(function() {
  var DbObjectID, LOG, app, assignShortLink, config, createRemark, createShortAlias, db, express, getRemark, getRemarkById, getRemarkByShortAlias, isValidUrl, jade, logger, mongo, publicPath, stylus, urlshortener, util, validateRemark, _;

  express = require("express");

  config = {
    maxRemarkLen: 640000,
    server: {
      domain: "localhost",
      port: 4000
    },
    isProduction: false
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
    return config.isProduction = true;
  });

  app.configure('development', function() {
    LOG.info('Configuring for development');
    return config.server.domain = "localhost";
  });

  mongo = require("mongodb");

  db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {});

  db.open(function() {
    LOG.info('Connection with DB - OK');
    return db.collection('sequences', function(err, collection) {
      return collection.insert({
        _id: 'remarkSeqNumber',
        value: 1
      });
    });
  });

  app.get('/', function(req, res) {
    return res.render('index', {});
  });

  DbObjectID = mongo.ObjectID;

  getRemarkByShortAlias = function(shortAlias, res) {
    return db.collection("remark", function(err, collection) {
      return collection.find({
        'shortAlias': shortAlias
      }, function(err, cursor) {
        if (err !== null) {
          LOG.warn('Error occured while searching remark with shortAlias: ' + shortAlias, 'getByShortAlias:remark');
          res.send(500);
          return;
        }
        return cursor.nextObject(function(err, obj) {
          if (obj !== null) {
            return res.json(obj);
          } else {
            LOG.warn('No remark with shortAlias ' + shortAlias + ' was found', 'getByShortAlias:remark');
            return res.send(404);
          }
        });
      });
    });
  };

  getRemarkById = function(remarkId, res) {
    return db.collection("remark", function(err, collection) {
      return collection.find({
        '_id': remarkId
      }, function(err, cursor) {
        if (err !== null) {
          LOG.warn('Error occured while searching remark with id: ' + remarkId, 'getById:remark');
          res.send(500);
          return;
        }
        return cursor.nextObject(function(err, obj) {
          if (obj !== null) {
            return res.json(obj);
          } else {
            LOG.warn('No remark with id ' + remarkId + ' was found', 'getById:remark');
            return res.send(404);
          }
        });
      });
    });
  };

  getRemark = function(req, res) {
    var remarkId;
    try {
      remarkId = new DbObjectID.createFromHexString(req.params.id);
      return getRemarkById(remarkId, res);
    } catch (ex) {
      LOG.warn('Failed to conver remark id: ' + req.params.id, 'get:remark');
      return getRemarkByShortAlias(req.params.id, res);
    }
  };

  app.get('/remark/:id', getRemark);

  app.get('/:id', getRemark);

  isValidUrl = function(url) {
    return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
  };

  validateRemark = function(remark) {
    var bytes;
    bytes = 0;
    if (!_.isUndefined(remark.links)) {
      _.each(remark.links, function(link, index) {
        if (!_.isUndefined(link.link)) bytes += link.link.length;
        if (!_.isUndefined(link.desc)) return bytes += link.desc.length;
      });
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

  createShortAlias = function(remark, res) {
    return db.collection("sequences", function(err, collection) {
      return collection.findAndModify({
        _id: 'remarkSeqNumber'
      }, [], {
        '$inc': {
          value: 1
        }
      }, {}, function(err, value) {
        var shortAlias;
        if (_.isUndefined(err) || err === null) {
          shortAlias = new Number(value.value).toString(36);
          return db.collection("remark", function(err, collection) {
            return collection.update({
              _id: remark._id
            }, {
              '$set': {
                shortAlias: shortAlias
              }
            }, function(err, objects) {
              if (_.isUndefined(err) || err === null) {
                LOG.info("Short alias is: " + shortAlias);
                remark.shortAlias = shortAlias;
              } else {
                console.log(err);
                LOG.error("Failed to set remark's short alias");
              }
              return res.json(remark);
            });
          });
        } else {
          return LOG.error("Failed to create short alias");
        }
      });
    });
  };

  createRemark = function(remark, res) {
    return db.collection("remark", function(err, collection) {
      return collection.insert(remark, function(err, objects) {
        var newRemark;
        newRemark = _.first(objects);
        return createShortAlias(newRemark, res);
      });
    });
  };

  app.post('/remark/', function(req, res) {
    var remark;
    if (req.is('*/json')) {
      remark = req.body;
      remark = {
        links: remark.links,
        note: remark.note
      };
      try {
        validateRemark(remark);
        return createRemark(remark, res);
      } catch (e) {
        return res.send(e, 400);
      }
    }
  });

  app.put('/remark', function(req, res) {
    return res.send(405);
  });

  assignShortLink = function(remark, res) {
    var link;
    if (_.isUndefined(remark.shortLink)) {
      link = "http://" + config.server.domain;
      if (!config.isProduction) link += ":" + config.server.port;
      link += "/#remark/" + remark._id;
      return urlshortener.makeShort(link, function(shortLink, err) {
        if (shortLink !== null) {
          remark.shortLink = shortLink;
          res.send(remark);
          db.collection("remark", function(err, collection) {
            return collection.save(remark);
          });
          return;
        }
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
