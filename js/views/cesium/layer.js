//A model that stores appearance settings for various objects.

define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
    'views/base',
], function(_, $, Backbone, localforage, BaseView){
    'use strict';
    var layerView = BaseView.extend({
        //urlRoot: '/appearance/',

        defaults: {
            on: true,                //whether to show the layer. overrides appearance.get('on') if that is present
            gnomeModel: undefined,   //gnome model this object represents
            parentModel: undefined,  //parent of the gnome model. Important for listening
            visObj: undefined,              //Cesium object to be managed by this layer
            appearance: undefined,   //optional appearance. If present, should be listened to.
            //It is VERY important to distinguish if appearance is a copy, or the 'original'.
            cesiumType: undefined,   //describes the cesium object type: primitive, entity, datasource, imagery
            cesiumView: undefined,   //the CesiumView object that this layer is attached to
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);

        },
    });
    return layerView;
});
