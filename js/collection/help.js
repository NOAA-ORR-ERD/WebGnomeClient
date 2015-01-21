define([
    'underscore',
    'backbone',
    'model/help/help',
    'fuse'
], function(_, Backbone, HelpModel, Fuse){
    var gnomeHelpCollection = Backbone.Collection.extend({
        model: HelpModel,
        url: '/help',

        search: function(term){
        	var options = {keys: ['attributes.html'], threshold: 0.7};
        	var f = new Fuse(this.models, options);
        	var result = f.search(term);
        	return result;
        }
    });

    return gnomeHelpCollection;
});