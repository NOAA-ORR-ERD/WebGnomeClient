define([
    'underscore',
    'backbone',
    'model/help/help'
], function(_, Backbone, HelpModel){
    var gnomeHelpCollection = Backbone.Collection.extend({
        model: HelpModel,
        url: '/help'
    });

    return gnomeHelpCollection;
});