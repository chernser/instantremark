
// Namespace object
var InstantRemark = {};

require([
    'domReady',
    'order!app/templates',
    'order!app/router.app',
    'order!app/model.remark',
    'order!app/view.create',
    'order!app/view.read',
    'order!app/view.error'

], function() {

    InstantRemark.app = new Backbone.Marionette.Application();

    InstantRemark.app.addRegions({
        mainRegion : "#_main"
    });

    // Bind our router
    InstantRemark.router = new AppRouter();
    Backbone.history.start();
});

