define([
    'underscore',
    'backbone'
], function(_, Backbone, swal){
    var helpModel = Backbone.Model.extend({
        urlRoot: '/help',
        defaults: {
            ready: false
        }
    });

    return helpModel;
});