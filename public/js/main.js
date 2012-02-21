
var __isDebug = true;

function debug(msg) {

    if ((__isDebug) && (typeof window.console != 'undefined'))
        console.log(msg);
}

require(
[
    'order!lib/jquery',
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
