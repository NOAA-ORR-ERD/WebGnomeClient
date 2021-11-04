define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water'
], function(_, Backbone, BaseModel, WaterModel){
    'use strict';
    var fayGravityViscous = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.FayGravityViscous',
            'water': undefined
        },

        model: {
            water: {'gnome.environment.water.Water': WaterModel}
        },

        toTree: function(){
            return '';
        }
    });

    return fayGravityViscous;
});