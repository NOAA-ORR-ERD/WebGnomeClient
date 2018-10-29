define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'model/environment/wind',
    'model/environment/water'
], function(_, $, Backbone, BaseModel, WindModel, WaterModel){
    'use strict';
    var WavesModel = BaseModel.extend({
        urlRoot: '/environment',
        defaults: {
            obj_type: 'gnome.environment.waves.Waves',
            wind: null,
            water: null,
        },

        model: {
            wind: Backbone.Model,
            water: Backbone.Model
        }
    });

    return WavesModel;
});