

var ReadView = Backbone.View.extend({

    model: null,

    initialize: function(attributes) {
        this.model = attributes.model;

    },


    render: function() {
        var that = this;

        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('read', function (tmpl) {

            debug(tmpl);

            var html = _.template(tmpl, {
                links:that.model.get("links"),
                note: that.model.get("note")
            });



            $(that.el).html(html);
            deferedObj.resolve();
        });


        return deferedObj.promise();
    }
});