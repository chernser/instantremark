
// Namespace object
var InstantRemark = {};

require(['domReady', 'order!app/templates', 'order!app/router.app', 'order!app/model.remark', 'order!app/view.create', 'order!app/view.read'], function() {

    InstantRemark.app = new Backbone.Marionette.Application();

    InstantRemark.app.addRegions({
        mainRegion : "#_main"
    });

   /* var defaultViewModel = new RemarkModel();
    var defaultView = new CreateView({model : defaultViewModel});
    InstantRemark.app.mainRegion.show(defaultView);*/

    // Bind our router
    InstantRemark.router = new AppRouter();
    Backbone.history.start();
});

