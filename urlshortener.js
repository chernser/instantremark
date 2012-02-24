
/*
  This simple module just calls google shortener link
  TODO: create own shortener service or install one

  POST https://www.googleapis.com/urlshortener/v1/url
  Content-Type: application/json

  {"longUrl": "http://www.google.com/"}

  http://goo.gl/bZQx
*/

(function() {
  var link;

  link = "http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html";

  exports.service = {};

  exports.service.http = require("https");

  exports.service.requestOptions = {
    host: 'www.googleapis.com',
    path: '/urlshortener/v1/url',
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    agent: false
  };

  exports.makeShort = function(link, callback) {
    var data, http, options, req;
    http = exports.service.http;
    data = '{"longUrl": "' + link + '"}';
    options = exports.service.requestOptions;
    req = http.request(options, function(res) {
      return res.on("data", function(data) {
        var json, strData;
        if (res.statusCode === 200) {
          strData = data.toString('utf8');
          json = JSON.parse(strData);
          return callback(json.id, null);
        } else {
          return callback(null, {
            error: 1,
            statusCode: res.statusCode
          });
        }
      });
    });
    req.on("error", function(error) {
      return callback(null, error);
    });
    req.write(data);
    return req.end();
  };

}).call(this);
