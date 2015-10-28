define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var userPrefs = BaseModel.extend({
        url: '/',

        defaults: {
            'time': 'datetime'
        },

        initialize: function(options){
            this.fetch();
        },

        // Overwriting the base model's restful methods so the model isn't sent to the API
        save: function() {
            var jsonModel = this.toJSON();
            localStorage.setItem('user_prefs', JSON.stringify(jsonModel));
        },

        fetch: function() {
            return JSON.parse(localStorage.getItem('user_prefs'));
        },

        destroy: function() {

        }
    });
    return userPrefs;
});