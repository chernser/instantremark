
// Namespace object
var InstantRemark = {};

var Log = new $logger.Logger("InstantRemark");

require([
    'domReady',
    'order!app/templates',
    'order!app/router.app',
    'order!app/model.remark',
    'order!app/view.create',
    'order!app/view.read',
    'order!app/view.error'

], function() {

    Log.trace("Starting application", "entrypoint.start");

    InstantRemark.app = new Backbone.Marionette.Application();

    InstantRemark.app.addRegions({
        mainRegion : "#_main"
    });

    // Bind our router
    Log.trace("Binding Router", "entrypoint.router.bind");
    InstantRemark.router = new AppRouter();
    Backbone.history.start();
});

