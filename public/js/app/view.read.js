
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

            $(that.el).html(tmpl);

            var linksEl = $(that.el).find("#links");

            _.each(that.model.get("links"), function(link, index) {
                var desc = _.isEmpty(link.desc) ? 'Link #' + index : link.desc;
                $('<li><a href="' + link.link +'" >' + desc + '</a></li>').
                    appendTo(linksEl);
            });

            $(that.el).find("#note").text(that.model.get("note"));
            $(that.el).find("#selfLink").val(window.location);

            deferedObj.resolve();
        });


        return deferedObj.promise();
    },

    events: {
        'click #shortLinkBtn' : 'obtainShortLink',
        'click #qrCodeBtn' : 'createQrCode'
    },



    obtainShortLink: function () {
        var that = this;

        $.ajax({
            url: "/remark/" + this.model.id + "/shortlink",
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
        var link = "/remark/" + this.model.id + "/shortlink";
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