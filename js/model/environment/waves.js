define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'model/environment/wind',
    'model/environment/water',
    'model/environment/gridwind'
], function(_, $, Backbone, BaseModel, WindModel, WaterModel, GridWindModel){
    'use strict';
    var WavesModel = BaseModel.extend({
        urlRoot: '/environment',
        defaults: {
            obj_type: 'gnome.environment.waves.Waves',
            wind: undefined,
            water: undefined,
            make_default_refs: false
        },

        model: {
            wind: {'gnome.environment.wind.Wind': WindModel,
                   'gnome.environment.environment_objects.GridWind': GridWindModel},
            water: {'gnome.environment.water.Water': WaterModel}
        },

        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
        }
    });

    return WavesModel;
});