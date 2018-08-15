define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water',
    'model/environment/wind'
], function(_, Backbone, BaseModel, WaterModel, WindModel){
    'use strict';
    var langmuir = BaseModel.extend({
        urlRoot: '/weatherer/',

        model: {
            water: Backbone.Model,
            wind: Backbone.Model
        },

        defaults: {
            'obj_type': 'gnome.weatherers.Langmuir',
            'water': null,
            'wind': null
        },

        toTree: function(){
            return '';
        }
    });

    return langmuir;
});