(function() {
  var DbObjectID, app, config, db, express, jade, mongo, publicPath, stylus, _;

  express = require("express");

  config = {
    server: {
      port: 4000
    }
  };

  app = express.createServer();

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

  app.get('/remark/:id', function(req, res) {
    var remarkId;
    remarkId = new DbObjectID.createFromHexString(req.params.id);
    return db.collection("remark", function(err, collection) {
      return collection.find({
        '_id': remarkId
      }, function(err, cursor) {
        return cursor.nextObject(function(err, obj) {
          return res.json(obj);
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

  app.put('/remark', function(req, res) {});

  app.listen(config.server.port);

}).call(this);
