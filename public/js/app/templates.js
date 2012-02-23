
/**
 * Use dynamic template loading
 */
Backbone.Marionette.TemplateManager.loadTemplate = function(templateId, callback){
    var that = this;
    var templateRoot = "/templates/";

    // TODO: create separate namespace for view templates
    if ((templateId == 'create') || (templateId == 'read')){
        templateRoot = "/view/";
    }

    $.get(templateRoot + templateId + ".html", function(template){
        callback.call(this, template);
    });
}



debug("Templates module is loaded");