
/**
 * Use dynamic template loading
 */
Backbone.Marionette.TemplateManager.loadTemplate = function(templateId, callback){
    var that = this;
    var templateRoot = "/templates/";

    $.get(templateRoot + templateId + ".html", function(template){
        callback.call(this, template);
    });
}



debug("Templates module is loaded");