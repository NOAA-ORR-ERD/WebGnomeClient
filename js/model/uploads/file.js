define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    'use strict';
    var FileObj = Backbone.Model.extend({
        idAttribute: "cid",

        defaults: {
            name: '',
            size: null,
            type: ''
        },

        initialize: function () {
            this.on("invalid", function (model, error) {
                console.log("Ooops: " + error)
            });
        },

        validate: function (attr) {
            if (typeof attr.name !== 'string' || attr.name.length === 0) {
                return "File Object has no name"
            }
            if (typeof attr.size !== 'number' || attr.size < 0) {
                return "File Object has invalid size"
            }
            if (typeof attr.type !== 'string' || attr.type.length === 0) {
                return "File Object has no type"
            }
        },
    	
    });

    return FileObj;
});
