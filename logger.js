/*
    Simple wrapper for winston or whatever will be
    choosen in future

 */

utils = require("util");
_ = require('underscore');


module.exports.Logger = function Logger(name) {
    this.name = name;
    this.logger = new require("winston");

    this.prototype = Logger.prototype;

    return this;
};

var Logger = module.exports.Logger;

Logger.prototype.getPointAddress = function(point, requestId) {
    if (_.isUndefined(point))
        return "";
    if (_.isUndefined(requestId))
        return '{' + point + '}';
    return '{' + requestId + ':' + point + '}';
}

Logger.prototype.debug = function(message, point, requestId) {
    var pointAddress = this.getPointAddress(point, requestId);
    this.logger.log('debug', utils.format("%s [%s]: %s",pointAddress, this.name, message) );
};

Logger.prototype.info = function(message, point, requestId) {
    var pointAddress = this.getPointAddress(point, requestId);
    this.logger.log('info', utils.format("%s [%s]: %s",pointAddress, this.name, message) );
};

Logger.prototype.warn = function(message, point, requestId) {
    var pointAddress = this.getPointAddress(point, requestId);
    this.logger.log('warn', utils.format("%s [%s]: %s",pointAddress, this.name, message) );
};

Logger.prototype.error = function(message, point, requestId) {
    var pointAddress = this.getPointAddress(point, requestId);
    this.logger.log('error', utils.format("%s [%s]: %s",pointAddress, this.name, message) );
};
