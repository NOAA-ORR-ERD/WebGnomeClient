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
            name: 'Waves'
        },

        model: {
            wind: WindModel,
            water: WaterModel
        }
    });

    return WavesModel;
});