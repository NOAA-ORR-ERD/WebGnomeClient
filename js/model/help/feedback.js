define([
    'underscore',
    'backbone'
], function(_, Backbone, swal){
    'use strict';
    var helpModel = Backbone.Model.extend({
        urlRoot: '/help',
        defaults: {
            helpful: false,
            response: ''
        }
    });

    return helpModel;
});