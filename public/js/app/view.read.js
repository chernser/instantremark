
var ReadView = Backbone.View.extend({

    model: null,

    initialize: function(attributes) {
        this.model = attributes.model;

    },

    render: function() {
        var that = this;

        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('read', function (tmpl) {

            var template = Handlebars.compile(tmpl);
            var context = {
                links: that.model.get("links"),
                note: that.model.get("note"),
                selfLink: window.location
            };
            for (var i = 0; i < context.links.length; ++i)
                if (context.links[i].desc == "")
                    context.links[i].desc = "Link #" + (i + 1);

            if (context.note == '')
                context.note = false;
            debug(context);
            var html = template(context);

            $(that.el).html(html);


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