(function() {
  var app, config, express, jade, publicPath, stylus;

  express = require("express");

  config = {
    server: {
      port: 4000
    }
  };

  app = express.createServer();

  jade = require("jade");

  stylus = require("stylus");

  publicPath = __dirname + '/public/';

  app.configure(function() {
    var stylusConf;
    app.set('view options', {
      layout: false,
      pretty: true
    });
    app.set('views', publicPath + '/views');
    app.set('view engine', 'jade');
    stylusConf = {
      src: __dirname + '/stylus/',
      dest: publicPath
    };
    app.use(stylus.middleware(stylusConf));
    return app.use(express.static(publicPath));
  });

  app.get('/', function(req, res) {
    return res.render('index', {});
  });

  app.listen(config.server.port);

}).call(this);
