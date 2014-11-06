define([
    'underscore',
    'backbone',
    'sweetalert'
], function(_, Backbone, swal){
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
            swal({
                title: 'Connection Error',
                text: 'Error establishing a session with the API server.',
                type: 'error',
            });
        }
    });

    return sessionModel;
});