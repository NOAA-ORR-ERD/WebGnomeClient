define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gnomeLocation = BaseModel.extend({
        urlRoot: '/location/',
    });

    return gnomeLocation;
});