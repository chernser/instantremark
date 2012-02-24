(function() {
  var DbObjectID, app, assignShortLink, config, db, express, jade, mongo, publicPath, stylus, urlshortener, _;

  express = require("express");

  config = {
    server: {
      domain: "localhost",
      port: 4000
    }
  };

  app = express.createServer();

  urlshortener = require("./urlshortener");

  jade = require("jade");

  stylus = require("stylus");

  _ = require("underscore");

  publicPath = __dirname + '/public/';

  app.configure(function() {
    var stylusConf;
    app.set('view options', {
      layout: false,
      pretty: true
    });
    app.set('views', publicPath + '/views');
    app.set('view engine', 'jade');
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

  app.get('/view/:view.html', function(req, res) {
    return res.render(req.params.view, {});
  });

  DbObjectID = mongo.ObjectID;

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

  app.post('/remark/', function(req, res) {
    var remark;
    if (req.is('*/json')) {
      remark = req.body;
      return db.collection("remark", function(err, collection) {
        return collection.insert(remark, function(err, objects) {
          return res.json(_.first(objects));
        });
      });
    }
  });

  app.put('/remark', function(req, res) {
    return res.send(405);
  });

  app.listen(config.server.port);

}).call(this);
