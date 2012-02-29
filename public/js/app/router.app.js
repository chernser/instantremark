
var AppRouter = Backbone.Router.extend({
    Log: null,

    routes : {

        'remark/new' : 'createNewRemark',
        'remark/:id' : 'showRemark',
        ':id' : 'showRemark'
    },


    initialize : function() {
        this.Log = new $logger.Logger("AppRouter");
        this.Log.trace("Router initialized", "router.initialize");
    },

    createNewRemark : function() {
        this.Log.trace("Create new remark", "router.remark.create");
        InstantRemark.model = new RemarkModel();
        InstantRemark.view_create = new CreateView({model: InstantRemark.model});
        InstantRemark.app.mainRegion.show(InstantRemark.view_create);
    },

    showRemark : function(id) {
        this.Log.trace("Show remark with id: '" + id + "'", "router.remark.show");
        if (id == '') {
            this.Log.warn("No id passed to show method", "router.remark.show.noid");
            return;
        }

        InstantRemark.model = new RemarkModel({_id: id});
        this.Log.trace("New remark model created", "router.remark.model.inited");

        InstantRemark.model.fetch({
            success: function(model, response) {
                this.Log.trace("Remark model fetched", "router.model.fetch.success");
                // Should we path model instead
                InstantRemark.view_read = new ReadView({model: InstantRemark.model});
                InstantRemark.app.mainRegion.show(InstantRemark.view_read);
            },
            error: function(model, response) {
                this.Log.trace("Fail to fetch model", "router.model.fetch.fail");

                var error = {errorCode: response.status};
                if (response.status == 400)
                    error.errorMessage = "Invalid remark reference. Please check.";
                if (response.status == 404)
                    error.errorMessage = "Remark not found.";

                this.Log.warn("Error from server: " + error , "router.model.fetch.fail");
                var errorView = new ErrorView(error);
                InstantRemark.app.mainRegion.show(errorView);
            }
        });


    }
});