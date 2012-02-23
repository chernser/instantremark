express = require("express")

config = {
server:
  {
  port: 4000
  }
}

app = express.createServer()
jade = require("jade")
stylus = require("stylus")
_ = require("underscore")

publicPath = __dirname + '/public/'

app.configure(() ->
    app.set('view options', {layout: false, pretty: true})
    app.set('views', publicPath + '/views')
    app.set('view engine', 'jade')
    app.use(express.bodyParser());



    stylusConf = {
      src: __dirname + '/stylus/',
      dest: publicPath # TODO: check this https://github.com/LearnBoost/stylus/issues/486
    }

    app.use(stylus.middleware(stylusConf))

    ## Should be after stylus middleare
    app.use(express.static(publicPath))
)


## Here is main app logic
mongo = require("mongodb")
db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {})
db.open(() ->
)

app.get('/', (req, res) ->
    res.render('index', {})
)

app.get('/view/:view.html', (req, res) ->
  res.render(req.params.view, {})

)

DbObjectID = mongo.ObjectID;

app.get('/remark/:id', (req, res) ->
  remarkId = new DbObjectID.createFromHexString(req.params.id)
  db.collection("remark", (err, collection) ->
    collection.find({'_id' : remarkId }, (err, cursor) ->
      cursor.nextObject((err, obj) ->
          res.json(obj)
      )

    )
  )
)

app.post('/remark/', (req, res) ->
  if req.is('*/json')
    remark = req.body
    ## TODO: add validation here
    db.collection("remark", (err, collection) ->
      collection.insert(remark, (err, objects) ->
          res.json(_.first(objects))
      )
    )
)

app.put('/remark', (req, res) ->


)

app.listen(config.server.port)


