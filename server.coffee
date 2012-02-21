

express = require("express");


config = {
  server : {
    port : 4000
  }
}

app = express.createServer()

app.configure(() ->
    app.use(express.static(__dirname + '/public'))
    app.set('view options', {layout: false})
)

app.listen(config.server.port)


