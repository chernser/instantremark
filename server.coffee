express = require("express")

config = {
  server:
    {
      domain: "localhost",
      port: 4000
    }
}

app = express.createServer()
urlshortener = require("./urlshortener")
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


## Presentation logic

app.get('/', (req, res) ->
    res.render('index', {})
)


app.get('/view/:view.html', (req, res) ->
  res.render(req.params.view, {})

)


## REST Part of logic

DbObjectID = mongo.ObjectID;

assignShortLink = (remark, res) ->
  if (_.isUndefined(remark.shortLink))
    link = "http://" + config.server.domain + ":" + config.server.port + "/#remark/" + remark._id
    console.log("requesting short link for: " + link)
    urlshortener.makeShort(link, (shortLink, err) ->
        if (shortLink != null)
          console.log(shortLink)
          remark.shortLink = shortLink;
          res.send(remark)
          db.collection("remark", (err, collection) ->
            collection.save(remark)
          )
          return

        console.log("error occure")
        if (err != null)
          console.log(err)
    )
  else
    console.log("short link exists")
    res.send(remark)


app.post('/remark/:id/shortlink', (req, res) ->

    try
      remarkId = new DbObjectID.createFromHexString(req.params.id)
    catch ex
      res.send(400)
      return

    db.collection("remark", (err, collection) ->
        collection.find({'_id' : remarkId }, (err, cursor) ->
            cursor.nextObject((err, obj) ->
                if (obj == null)
                  res.send(404)
                assignShortLink(obj, res)
            )
        )
    )

)

app.get('/remark/:id', (req, res) ->
  try
    remarkId = new DbObjectID.createFromHexString(req.params.id)
  catch ex
    res.send(400)
    return

  db.collection("remark", (err, collection) ->
    collection.find({'_id' : remarkId }, (err, cursor) ->
      cursor.nextObject((err, obj) ->
          if (obj != null)
            res.json(obj)
          else
            res.send(404)
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
    res.send(405); ## remark is like a stone - once saved can't be corrected
)

app.listen(config.server.port)


