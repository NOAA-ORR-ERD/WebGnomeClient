//A model that stores appearance settings for various objects.

define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
], function(_, $, Backbone, localforage){
    'use strict';
    var layerModel = Backbone.Model.extend({

        type: 'cesium',
        parentEl: 'primitive',
        model: undefined,
        visObj: undefined,
        appearance: undefined,

        initialize: function(options) {
            this.type = options.type;
            this.parentEl = options.parentEl;
            this.model = options.model;
            this.visObj = options.visObj;
            if(!options.id && options.model && options.model.id) {
                this.id = options.model.id;
            } else {
                this.id = options.id;
            }
            Backbone.Model.prototype.initialize.call(this, options);
            Promise.resolve(this.visObj).then(_.bind(function(visObj){
                this.visObj = visObj;
            }, this));
        },

        getAppearance: function() {
            return this.model.get('_appearance');
        }

    });
    return layerModel;
});
