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


var RemarkModel = Backbone.Model.extend({

    idAttribute: '_id',

    links : null,

    note : null,

    urlRoot: '/remark/',


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