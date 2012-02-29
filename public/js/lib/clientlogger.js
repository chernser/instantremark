/**
 *  Client side logger
 *
 *
 *
 */

// Namespace
var Pinkerton = {
    seqNumber: 0
};

// Better alias
var $logger = Pinkerton;

// Configuration global object
Pinkerton.Configuration = {


};


Pinkerton.log = function(logger, level, message, point) {
    var seqNumber = ++Pinkerton.seqNumber;

    var time = new Date().toGMTString();
    var logMessage = time + " {" +  level + ":" + seqNumber + "} [" + logger.name + "] ";

    if (typeof point != 'undefined') {
        logMessage += "<" + point + ">"
    }

    if ((typeof message != 'undefined') || (message != null)) {
        logMessage += ": ";
    }

    if (typeof message == 'string') {
        logMessage += message;
    }

    console.log(logMessage);
};


Pinkerton.flush = function(logger) {

}

/**
 * Logger class
 *
 *
 * @param name
 */
Pinkerton.Logger = function(name) {
    this.name = name;
    this.prevCallee = null;
    return this;
};

Pinkerton.Logger.prototype.flush = function() {
    Pinkerton.flush(this);
};

Pinkerton.Logger.prototype.debug = function(messageObject, point) {
    Pinkerton.log(this, 'debug', messageObject, point);
};

Pinkerton.Logger.prototype.trace = function(messageObject, point) {
    if (this.prevCallee === arguments.callee.caller)
        console.log("same callee");
    else
        this.prevCallee = arguments.callee.caller;
    Pinkerton.log(this, 'trace', messageObject, point);
};


Pinkerton.Logger.prototype.info = function(messageObject, point) {
    Pinkerton.log(this, 'info', messageObject, point);
};

Pinkerton.Logger.prototype.warn = function(messageObject, point) {
    if (this.prevCallee === arguments.callee.caller)
        console.log("same callee");
    else
        this.prevCallee = arguments.callee.caller;

    Pinkerton.log(this, 'warn', messageObject, point);
};

Pinkerton.Logger.prototype.error = function(messageObject, point) {
    Pinkerton.log(this, 'error', messageObject, point);
};
