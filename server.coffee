

express = require("express")

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
  },

  isProduction: false
}

app = express.createServer()
urlshortener = require("./urlshortener")
stylus = require("stylus")
jade = require("jade")
_ = require("underscore")
util = require("util")
logger = require("./logger")

LOG = new logger.Logger("InstatRemark.server")


publicPath = __dirname + '/public/'
LOG.info("Public dir path: " + publicPath)

app.configure(() ->
    app.set('view options', {layout: false, pretty: true})
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


app.configure('production', () ->
  LOG.info('Configuring for production')

  config.server.domain = "inremark.com"

  config.captcha.service.publicKey = "6LeZLM4SAAAAAH7JZKoA5EbfkjNUFbLhNjFf55cV"
  config.captcha.service.privateKey = "6LeZLM4SAAAAAD6l91xsRu1i4vr8pAJ7LFcfDRMC"

  config.isProduction = true
)

app.configure('development', () ->
  LOG.info('Configuring for development')

  config.server.domain = "localhost"

  config.captcha.service.publicKey = "6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7"
  config.captcha.service.privateKey = "6Lf6I84SAAAAAG6FrCqB1-q8WGzo0WrBdnS_E-Bq"
)

## Here is main app logic
mongo = require("mongodb")
db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {})
db.open(() ->
  LOG.info('Connection with DB - OK')
)


## Presentation logic

app.get('/', (req, res) ->
    res.render('index', {})
)

Recaptcha = require("recaptcha").Recaptcha

app.get('/captcha.js', (req, res) ->
    publicKey =  config.captcha.service.publicKey
    html = util.format("var RecaptchaPublicKey = \"%s\";", publicKey)
    res.send(html,  { 'Content-Type': 'text/javascript' })
)

## REST Part of logic

DbObjectID = mongo.ObjectID;


app.get("/:id", (req, res) ->
  res.send("<h1>Hello</h1>");
)



app.get('/remark/:id', (req, res) ->
  try
    remarkId = new DbObjectID.createFromHexString(req.params.id)
  catch ex
    LOG.warn('Failed to conver remark id: ' + req.params.id, 'get:remark')
    res.send(400)
    return

  db.collection("remark", (err, collection) ->
    collection.find({'_id' : remarkId }, (err, cursor) ->
      if (err != null)
        LOG.warn('Error occured while searching remark with id: ' + remarkId, 'get:remark')
        res.send(500)
        return

      cursor.nextObject((err, obj) ->
          if (obj != null)
            res.json(obj)
          else
            LOG.warn('No remark with id ' + remarkId + ' was found', 'get:remark')
            res.send(404)
      )
    )
  )
)


## TODO: use some validation library
isValidUrl = (url) ->
  return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)

validateRemark = (remark) ->
  bytes = 0

  if (!_.isUndefined(remark.link))
    _.each(remark.links, (link, index) ->
        if (!_.isUndefined(link.link))
          bytes += link.link.length
        if (!_.isUndefined(link.desc))
          bytes += link.desc.length
    )

  if (!_.isUndefined(remark.note))
    bytes += remark.note.length;

  if (bytes > config.maxRemarkLen)
    throw {error: 1, desc: "Remark total size should be &le; " + config.maxRemarkLen}

  if (bytes == 0)
    throw {error: 2, desc: "We do not store empty remarks"}

validateCaptcha = (req, callback) ->
  data = {
    remoteip:  req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response:  req.body.recaptcha_response_field
  }

  pubKey = config.captcha.service.publicKey
  privKey = config.captcha.service.privateKey
  recaptcha = new Recaptcha(pubKey, privKey, data)

  recaptcha.verify( callback)

app.post('/remark/', (req, res) ->
  validateCaptcha(req, (success, error) ->
    if (!success)
      res.send({error: 3, desc: "Invalid captcha. Try again, please"}, 400)
      return

    if req.is('*/json')
      remark = req.body
      ## TODO: add validation here
      try
        validateRemark(remark)
        console.log("remark is valid")
        db.collection("remark", (err, collection) ->
          collection.insert(remark, (err, objects) ->
              res.json(_.first(objects))
          )
        )
      catch e
        console.log(e)
        res.send(e, 400)
  )
)

app.put('/remark', (req, res) ->
    res.send(405); ## remark is like a stone - once saved can't be corrected
)

assignShortLink = (remark, res) ->
  if (_.isUndefined(remark.shortLink))
    link = "http://" + config.server.domain
    if (!config.isProduction)
      link += ":" + config.server.port
    link += "/#remark/" + remark._id

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

LOG.info("Going to listen on port: " + config.server.port )
app.listen(config.server.port)


