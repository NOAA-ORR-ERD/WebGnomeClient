define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var sessionModel = Backbone.Model.extend({
        url: '/model',
        defaults: {
            'id': null,
        },
        initialize: function(callback){
            this.fetch({
                success: callback
            });
        }
    });

    return sessionModel;
});