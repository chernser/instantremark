var CreateView = Backbone.View.extend({

    model : null,

    numberOfLinks : 3,

    isModelChanged : false,

    linkToElMap : [],

    initialize : function(init) {
        this.model = init.model;
    },

    render: function() {

        var that = this;
        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('create', function (tmpl) {

            var linkAlphas = getNAlphas('a', that.numberOfLinks);

            var btnAlphas = getNextNAlphas(_.last(linkAlphas), that.numberOfLinks < 24 ? 3 : 2);
            var canAddMore = that.numberOfLinks + 3 < 28;
            var html = _.template(tmpl, {
                linkAlphas:linkAlphas,
                addLinksCaption:btnAlphas.join(","),
                canAddMore:canAddMore,
                model:that.model
            });

            $(that.el).html(html);
            deferedObj.resolve();
        });


        return deferedObj.promise();
    },

    events : {
        'click #addMoreLinks' : 'addMoreLinks',
        'keypress input, textarea' : 'inputChanged',
        'paste input, textarea' : 'inputChanged',
        'focusout input, textarea' : 'updateModel',
        'keyup input,textarea' : 'inputChanged',
        'click #persistBtn' : 'save'

    },

    addMoreLinks : function() {
        debug("User requested more links?");

        this.numberOfLinks += 3;
        if (this.numberOfLinks > 26)
            this.numberOfLinks = 26;


        this.updateModel();
        this.render();
        this.recalcLeftSymbols();
    },

    recalcLeftSymbols : function() {
        var lettersLeft = 640000 - $("#note").val().length;
        $("#letters-left").text(lettersLeft + " chars left");
    },

    inputChanged : function(e) {
        this.isModelChanged = true;
        if (e.target.nodeName.toUpperCase() == "TEXTAREA")
            this.recalcLeftSymbols();
    },

    updateModel:function () {
        if (this.isModelChanged) {
            debug("update model");

            try {
                var that = this;

                // TODO: optimize
                var links = new Array();
                $("#links li").each(function (index, li) {
                    $(li).find("[rel=\"link\"]").css("background-color", "white");
                    var linkObj = that.linkElToObj(li);
                    if (linkObj != null) {
                        that.linkToElMap[linkObj.link] = li;
                        links.push(linkObj);
                    }
                });

                var note = $("#note").val();

                var result = this.model.set(
                    {links:links, note:note},

                    {
                        error:function (model, error) {
                            if (!_.isUndefined(error.type)) {
                                if (error.type == 'links') {
                                    _.each(error.list, function(link, index) {
                                        if (!_.isUndefined(that.linkToElMap[link.link]))
                                            $(that.linkToElMap[link.link]).find("[rel=\"link\"]").css("background-color", "pink");
                                    });
                                }
                            }
                        }
                    }
                );

                if (result == false)
                    alert("There some values invalid");
                this.updateSummary();
            } finally {
                this.isModelChanged = false;
            }
        }
    },

    linkElToObj : function(el) {
        var link = $(el).find("[rel=\"link\"]").val();
        var desc = $(el).find("[rel=\"desc\"]").val();

        if (link != '')
            return {link: link, desc: desc};
        return null;
    },

    updateSummary : function() {

    },

    save : function() {
        debug("saving model");
        this.model.save();
    }

});