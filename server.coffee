

express = require("express")

config = {
  maxRemarkLen: 640000,
  server: {
      domain: "localhost",
      port: 4000
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

  config.isProduction = true
)

app.configure('development', () ->
  LOG.info('Configuring for development')

  config.server.domain = "localhost"
)

## Here is main app logic
mongo = require("mongodb")
db = new mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {})
db.open(() ->
  LOG.info('Connection with DB - OK')
  db.collection('sequences', (err, collection) ->
    # init remark sequence counter
    collection.insert({_id: 'remarkSeqNumber', value: 1});
  )
)




## Presentation logic

app.get('/', (req, res) ->
    res.render('index', {})
)


## REST Part of logic

DbObjectID = mongo.ObjectID;

getRemarkByShortAlias = (shortAlias, res) ->
  db.collection("remark", (err, collection) ->
      collection.find({'shortAlias' : shortAlias }, (err, cursor) ->
          if (err != null)
            LOG.warn('Error occured while searching remark with shortAlias: ' + shortAlias, 'getByShortAlias:remark')
            res.send(500)
            return

          cursor.nextObject((err, obj) ->
              if (obj != null)
                res.json(obj)
              else
                LOG.warn('No remark with shortAlias ' + shortAlias + ' was found', 'getByShortAlias:remark')
                res.send(404)
          )
      )
  )

getRemarkById = (remarkId, res) ->
  db.collection("remark", (err, collection) ->
      collection.find({'_id' : remarkId }, (err, cursor) ->
          if (err != null)
            LOG.warn('Error occured while searching remark with id: ' + remarkId, 'getById:remark')
            res.send(500)
            return

          cursor.nextObject((err, obj) ->
              if (obj != null)
                res.json(obj)
              else
                LOG.warn('No remark with id ' + remarkId + ' was found', 'getById:remark')
                res.send(404)
          )
      )
  )

getRemark = (req, res) ->
  try
    remarkId = new DbObjectID.createFromHexString(req.params.id)
    getRemarkById(remarkId, res)
  catch ex
    LOG.warn('Failed to conver remark id: ' + req.params.id, 'get:remark')
    getRemarkByShortAlias(req.params.id, res)


app.get('/remark/:id', getRemark)

app.get('/:id', getRemark)

## TODO: use some validation library
isValidUrl = (url) ->
  return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)

validateRemark = (remark) ->
  bytes = 0

  if (!_.isUndefined(remark.links))
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

createShortAlias = (remark, res)->
  db.collection("sequences", (err, collection) ->
    collection.findAndModify({_id: 'remarkSeqNumber'}, [], {'$inc': {value: 1}}, {}, (err, value) ->
      if (_.isUndefined(err) || err == null)
        shortAlias = new Number(value.value).toString(36)
        db.collection("remark", (err, collection) ->
          collection.update({_id: remark._id}, { '$set' : {shortAlias: shortAlias} }, (err, objects) ->
            if (_.isUndefined(err) || err == null)
              LOG.info("Short alias is: " + shortAlias)
              remark.shortAlias = shortAlias
            else
              console.log(err)
              LOG.error("Failed to set remark's short alias")
            res.json(remark);
          )
        )
      else
        LOG.error("Failed to create short alias")
    )
  )

createRemark = (remark, res) ->
  db.collection("remark", (err, collection) ->
      collection.insert(remark, (err, objects) ->
          newRemark = _.first(objects)
          createShortAlias(newRemark, res)
      )
  )


app.post('/remark/', (req, res) ->
  if req.is('*/json')
    remark = req.body
    remark = { links: remark.links, note: remark.note}
    try
      validateRemark(remark)
      createRemark(remark, res)
    catch e
      res.send(e, 400)
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

    urlshortener.makeShort(link, (shortLink, err) ->
        if (shortLink != null)
          remark.shortLink = shortLink;
          res.send(remark)
          db.collection("remark", (err, collection) ->
              collection.save(remark)
          )
          return

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


