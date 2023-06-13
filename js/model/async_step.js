define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gnomeStep = BaseModel.extend({
        url: '/async_step',
        initialize: function(options){
            if (options && options.url) {
                this.url = options.url;
            }
            // no op initialization because base model has a model rewind listener
        },
        fetch: function(options) {
            options.error = function(err){
                console.error(err);
            }
            return BaseModel.prototype.fetch.call(this, options);
        }
    });
    return gnomeStep;
});