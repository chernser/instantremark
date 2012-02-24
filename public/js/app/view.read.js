

var ReadView = Backbone.View.extend({

    model: null,

    initialize: function(attributes) {
        this.model = attributes.model;

    },


    render: function() {
        var that = this;

        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('read', function (tmpl) {

            var html = _.template(tmpl);

            $(that.el).html(html({
                links:that.model.get("links"),
                note: that.model.get("note"),
                selfLink: window.location
            }));
            deferedObj.resolve();
        });


        return deferedObj.promise();
    },

    events: {
        'click #shortLinkBtn' : 'obtainShortLink',
        'click #qrCodeBtn' : 'createQrCode'
    },

    obtainShortLink: function () {
        var remarkId = this.model.id;
        var that = this;

        $.ajax({
            url: "http://localhost:4000/remark/" + remarkId + "/shortlink",
            type: "POST",
            success: function(data) {
                debug("success!!!");
                debug(data);
                $(that.el).find("#selfLink").val(data.shortLink);
                $(that.el).find("#shortLink").remove();

                that.model.set({ shortLink: data.shortLink});
            },

            error: function(error) {
                debug("error!!!");
            }

        })
    },

    createQrCode: function() {
        var link = "http://localhost:4000/remark/" + this.model.id + "/shortlink";
        if (this.model.get("shortLink") != null)
            link = this.model.get("shortLink");

        $("#qrCodeCanvas").html("");
        $("#qrCodeCanvas").qrcode({
            text: link,
            width: 220,
            height: 220
        });

    }
});