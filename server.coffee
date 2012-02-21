express = require("express")
;


config = {
server:
  {
  port: 4000
  }
}

app = express.createServer()
jade = require("jade")
stylus = require("stylus")

publicPath = __dirname + '/public/'

app.configure(() ->
    app.set('view options', {layout: false, pretty: true})
    app.set('views', publicPath + '/views')
    app.set('view engine', 'jade')


    stylusConf = {
      src: __dirname + '/stylus/',
      dest: publicPath # TODO: check this https://github.com/LearnBoost/stylus/issues/486
    }

    app.use(stylus.middleware(stylusConf))

    ## Should be after stylus middleare
    app.use(express.static(publicPath))
)

app.get('/', (req, res) ->
    res.render('index', {})
)

app.listen(config.server.port)


