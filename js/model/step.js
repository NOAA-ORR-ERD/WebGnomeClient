define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gnomeStep = BaseModel.extend({
        url: '/step',
    });

    return gnomeStep;
});