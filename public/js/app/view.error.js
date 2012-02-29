

var ErrorView = Backbone.View.extend({

    errorMessage: "",

    errorCode: 500,

    initialize: function(attributes) {
        if (!_.isUndefined(attributes.errorCode))
            this.errorCode = attributes.errorCode;

        switch (this.errorCode) {
            case 400:
                this.errorMessage = "Bad request";
                break;
            case 401:
                this.errorMessage = "Not authorised";
                break;
            case 403:
                this.errorMessage = "Forbidden";
                break;
            case 404:
                this.errorMessage = "Remark Not Found";
                break;
            case 405:
                this.errorMessage = "Method is not allowed";
                break;
            default:
                this.errorMessage = "Error occured on server. Please, try again.";
        }


        // Override error message
        if (!_.isUndefined(attributes.errorMessage))
            this.errorMessage = attributes.errorMessage;

    },


    render: function() {
        var that = this;

        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('error', function (tmpl) {

            var template = Handlebars.compile(tmpl);
            var html = template({errorMessage: that.errorMessage});

            $(that.el).html(html);
            deferedObj.resolve();
        });


        return deferedObj.promise();
    }

});