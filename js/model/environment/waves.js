define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'model/environment/gridwind',
    'model/environment/water'
], function(_, $, Backbone, BaseModel, GridWindModel, WaterModel){
    'use strict';
    var WavesModel = BaseModel.extend({
        urlRoot: '/environment',
        defaults: {
            obj_type: 'gnome.environment.waves.Waves'
        },

        model: {
            wind: GridWindModel,
            water: WaterModel
        }
    });

    return WavesModel;
});