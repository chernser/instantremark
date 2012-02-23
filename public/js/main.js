
var __isDebug = true;

function debug(msg) {

    if ((__isDebug) && (typeof window.console != 'undefined'))
        console.log(msg);
}

require(
[
    'order!lib/jquery.1.7.1',
    'order!lib/underscore',
    'order!lib/backbone',
    'order!lib/backbone.marionette',
    'order!lib/bootstrap',
    'order!app/application'
],
    function () {
        debug("Loading modules is finished");
    }
);


