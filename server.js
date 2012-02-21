(function() {
  var app, config, express;

  express = require("express");

  config = {
    server: {
      port: 4000
    }
  };

  app = express.createServer();

  app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    return app.set('view options', {
      layout: false
    });
  });

  app.listen(config.server.port);

}).call(this);
