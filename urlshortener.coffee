###
  This simple module just calls google shortener link
  TODO: create own shortener service or install one

  POST https://www.googleapis.com/urlshortener/v1/url
  Content-Type: application/json

  {"longUrl": "http://www.google.com/"}

  http://goo.gl/bZQx
###

link = "http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html"

exports.service = {}

exports.service.http = require("https")

exports.service.requestOptions = {
  host: 'www.googleapis.com',
  path: '/urlshortener/v1/url',
  method: "POST",
  headers:  {
    "Content-Type": "application/json"
  },
  agent: false
}

exports.makeShort = (link, callback) ->

  http = exports.service.http
  data = '{"longUrl": "' + link + '"}'
  options = exports.service.requestOptions;

  req = http.request(options, (res) ->
      res.on("data", (data) ->
          if (res.statusCode == 200)
            strData = data.toString('utf8')
            json = JSON.parse(strData)

            callback(json.id, null)
          else
            callback(null, {error: 1, statusCode: res.statusCode})
      )
  )

  req.on("error", (error) ->
    callback(null, error)
  )

  req.write(data)
  req.end()
