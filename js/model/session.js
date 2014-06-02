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
                success: callback,
                error: this.error
            });
        },

        error: function(){
            var msg = 'Error establishing a session with the API Server';
            console.log(msg);
            alert(msg);
        }
    });

    return sessionModel;
});