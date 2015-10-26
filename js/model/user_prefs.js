define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gnomeStep = BaseModel.extend({
        url: '/',

        defaults: {
            'time': 'datetime'
        },

        initialize: function(options){
            
        },


        // Overwriting the base model's restful methods so the model isn't sent to the API
        save: function() {

        },

        fetch: function() {

        },

        destroy: function() {

        }
    });
    return gnomeStep;
});