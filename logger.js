/*
    Simple wrapper for winston or whatever will be
    choosen in future

 */

utils = require("util");
_ = require('underscore');
events = require('events');

/**
 * Class representing standard logger instance
 *
 * @param name
 */
exports.Logger = function Logger(name) {
    this.name = name;


    this.prototype = Logger.prototype;

    return this;
};

var Logger = module.exports.Logger;

// Event processing
Logger.eventEmitter = new events.EventEmitter();

Logger.eventEmitter.on('logmessage', function(logMessage) {
    console.log(logMessage);

});

Logger.emitLogMessage = function(logger, level, message, point, requestId) {
    var logMessage = {
        time: new Date().toGMTString(),
        logger: logger.name,
        level: level,
        message: message,
        point: typeof point != 'undefined' ? point : null,
        requestId: typeof requestId != 'undefined' ? requestId : null
    };

    Logger.eventEmitter.emit('logmessage', logMessage);
}

/**
 * Logger methods
 */
Logger.prototype.debug = function(message, point, requestId) {
    Logger.emitLogMessage(this, 'debug', message, point, requestId);
};

Logger.prototype.info = function(message, point, requestId) {
    Logger.emitLogMessage(this, 'info', message, point, requestId);
};

Logger.prototype.warn = function(message, point, requestId) {
    Logger.emitLogMessage(this, 'warn', message, point, requestId);
};

Logger.prototype.error = function(message, point, requestId) {
    Logger.emitLogMessage(this, 'error', message, point, requestId);
};







