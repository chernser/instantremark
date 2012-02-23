
var AppRouter = Backbone.Router.extend({
    routes : {

        'remark/new' : 'createNewRemark',
        'remark/:id' : 'showRemark'
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
        InstantRemark.model = new RemarkModel({_id: id});
        InstantRemark.model.fetch();

        InstantRemark.view_read = new ReadView({model: InstantRemark.model});
        InstantRemark.app.mainRegion.show(InstantRemark.view_read);
    }
});