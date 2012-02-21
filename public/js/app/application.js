
var app = null;



function initializeRoute() {

}



require(['domReady', 'order!app/templates', 'order!app/create_view'], function() {
    app = new Backbone.Marionette.Application();

    app.addInitializer(initializeRoute.bind(app));

    app.addRegions({
        mainRegion : "#_main"
    });

    var defaultViewModel = new CreateViewModel();
    var defaultView = new CreateView({model : defaultViewModel});
    app.mainRegion.show(defaultView);

});