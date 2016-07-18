define([
    'underscore',
    'backbone',
    'moment'
], function(_, Backbone, moment){
    'use strict';
    var environment = Backbone.Collection.extend({
        areDataValid: function() {
            
        }
    });

    return environment;
});