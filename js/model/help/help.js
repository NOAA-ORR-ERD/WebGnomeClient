define([
    'underscore',
    'backbone'
], function(_, Backbone, swal){
    var helpModel = Backbone.Model.extend({
        urlRoot: '/help',

        defaults: {
            response: '',
            helpful: false
        }
    });

    return helpModel;
});