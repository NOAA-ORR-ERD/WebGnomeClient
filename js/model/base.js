define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var baseModel = Backbone.Model.extend({
        initialize: function(options){
            Backbone.Model.prototype.initialize.call(options, this);
        },
    });

    return baseModel;
});