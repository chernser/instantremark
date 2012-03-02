/**
 * Collection of commonly used appenders
 *
 *
 */


/**
 * Simple console appender. Prints logMessage as is if no format is set
 *
 * Console appender doesn't have flush method because it writes messages imediately to console
 *
 * @param logMessage
 */
exports.ConsoleAppender = function(logMessage) {
    if ((typeof logMessage != 'string') && (typeof exports.ConsoleAppender.format != 'undefined')) {
        var format = exports.ConsoleAppender.format;

        var message = new Array(0);
        var isPlaceholder = false;
        for (var index in format) {
            if (format[index] == '%') {
                isPlaceholder = true;
            } else if (isPlaceholder) {
                switch (format[index]) {
                    case 'S':
                        message.push(logMessage.seqNumber);
                        break;
                    case 't':
                        message.push(logMessage.time);
                        break;
                    case 'l':
                        message.push(logMessage.level);
                        break;
                    case 'L':
                        message.push(logMessage.logger);
                        break;
                    case 'p':
                        if (typeof logMessage.point != 'undefined')
                            message.push(logMessage.point);
                        break;
                    case 'm':
                        message.push(logMessage.message);
                        break;
                    case '%':
                        // escape '%'
                        message.push('%');
                    default:
                        // Unknown place holder append as is
                        message.push("%" + format[index]);
                }
                isPlaceholder = false;
            } else {
                message.push(format[index]);
            }
        }

        console.log(message.join(''));

    } else {
        console.log(logMessage);
    }
}

/**
 * Console appender format settings
 *
 *  %S - sequence number
 *  %t - time (GMT full format)
 *  %l - level (debug, warn, error ...)
 *  %L - logger name
 *  %p - point (mark set while calling loging method)
 *  %m - message (if object - will not be stringified)
 *  %% - to escape '%'
 *
 *
 */
exports.ConsoleAppender.format = "%S> %t %l: [%L:%p]: %m";

/**
 * Simple MongoDb appender
 *
 * @param logMessage
 */
exports.MongoDbAppender = function(logMessage) {
    if (exports.MongoDbAppender.isConnected) {
        exports.MongoDbAppender.db.collection('log', function (err, collection) {
            if (err == null) {
                collection.insert(logMessage);
            }
        });
    } else {
        exports.MongoDbAppender.offLineCache.push(logMessage);
    }
};

exports.MongoDbAppender.isConnected = false;

exports.MongoDbAppender.offLineCache = new Array();

exports.MongoDbAppender.flushCache = function() {
    exports.MongoDbAppender.isConnected = true;
    exports.MongoDbAppender(exports.MongoDbAppender.offLineCache);

    exports.MongoDbAppender.offLineCache = null;
}


mongo = require('mongodb');

exports.MongoDbAppender.db = new  mongo.Db("instantremark", new mongo.Server('localhost', 27017, {}), {});
exports.MongoDbAppender.db.open( function() {
    console.log("logger db is open");
    exports.MongoDbAppender.flushCache();
});
