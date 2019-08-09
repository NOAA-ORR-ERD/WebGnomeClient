define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel) {
    'use strict';
    var gnomeStep = BaseModel.extend({
        url: '/step',
        initialize: function(options) {
            // no op initialization because base model has a model rewind listener
        }
    });

    return gnomeStep;
});
