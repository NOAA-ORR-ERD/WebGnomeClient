define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var sessionModel = Backbone.Model.extend({
        url: '/session',
        defaults: {
            'id': null,
        },
        initialize: function(callback){
            this.save(null, {
                success: callback
            });
        }
    });

    return sessionModel;
});