
function getAlphaRange(startAlpha, endAlpha) {
    var startCode = startAlpha.charCodeAt(0);
    var endCode = endAlpha.charCodeAt(0);
    var range = new Array();

    for (var charCode = startCode; charCode <= endCode; ++charCode)
        range.push(String.fromCharCode(charCode));

    return range;
}

function getNAlphas(startAlpha, n) {
    var endAlpha = String.fromCharCode(startAlpha.charCodeAt(0) + n - 1);
    return getAlphaRange(startAlpha, endAlpha);
}

function getNextNAlphas(startWith, n) {
    var startAlpha = String.fromCharCode(startWith.charCodeAt(0) + 1);
    return getNAlphas(startAlpha, n);
}


var CreateViewModel = Backbone.Model.extend({

    links : null,

    note : null,

    initialize: function() {
    },

    validate: function(attributes) {

        var that = this;

        if (_.isUndefined(attributes) || _.isNull(attributes))
            return "Attributes can not be null";


        if (!_.isUndefined(attributes.links)) {
            if (!_.isArray(attributes.links))
                return "Links attribute is not array";


            var invalidLinks = new Array();
            _.each(attributes.links, function(link) {
                if (!that.validateLink(link))
                    invalidLinks.push(link);
            });

            if (!_.isEmpty(invalidLinks))
                return {type: 'links', list: invalidLinks};
        }

        if (!_.isUndefined(attributes.note)) {
            if (!_.isString(attributes.note))
                return "Note should be a string";
        }
    },

    validateLink : function(link) {

        if (!_.isString(link.link))
            return false;

        // TODO: move to some common lib or use plugin
        return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(link.link);
    },

    getLinkAt: function(index) {
        var links = this.get("links");
        if (_.isEmpty(links))
            return null;
        if ((index > links.length) || (index < 0))
            return null;

        return links[index];
    }

});


var CreateView = Backbone.View.extend({

    // view model
    model : null,

    numberOfLinks : 3,

    isModelChanged : false,

    initialize : function(init) {
        this.model = init.model;
    },

    render: function() {

        var that = this;
        var deferedObj = $.Deferred();

        Backbone.Marionette.TemplateManager.get('create_view', function (tmpl) {

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
                    if (linkObj != null)
                        links.push(linkObj);
                });

                var note = $("#note").val();

                var result = this.model.set(
                    {links:links, note:note},

                    {
                        error:function (model, error) {
                            if (!_.isUndefined(error.type)) {
                                if (error.type == 'links') {
                                    _.each(error.list, function(link, index) {
                                        $(link.el).find("[rel=\"link\"]").css("background-color", "pink");
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
            return {link: link, desc: desc, el: el};
        return null;
    },

    updateSummary : function() {

    },

    save : function() {
        this.model.save();
    }

});