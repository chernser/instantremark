
var AppRouter = Backbone.Router.extend({
    routes : {

        'remark/new' : 'createNewRemark',
        'remark/:id' : 'showRemark',
        ':id' : 'showRemark'
    },


    initialize : function() {

    },

    createNewRemark : function() {
        debug("create new remark");
        InstantRemark.model = new RemarkModel();
        InstantRemark.view_create = new CreateView({model: InstantRemark.model});
        InstantRemark.app.mainRegion.show(InstantRemark.view_create);
    },

    showRemark : function(id) {
        debug("show remark with id: " + id + " at " + new Date());
        if (id == '')
        return
        InstantRemark.model = new RemarkModel({_id: id});
        InstantRemark.model.fetch({
            success: function(model, response) {
                // Should we path model instead
                InstantRemark.view_read = new ReadView({model: InstantRemark.model});
                InstantRemark.app.mainRegion.show(InstantRemark.view_read);
            },
            error: function(model, response) {
                debug(response.status);

                var error = {errorCode: response.status};
                if (response.status == 400)
                    error.errorMessage = "Invalid remark reference. Please check.";
                if (response.status == 404)
                    error.errorMessage = "Remark not found.";

                var errorView = new ErrorView(error);
                InstantRemark.app.mainRegion.show(errorView);
            }
        });


    }
});