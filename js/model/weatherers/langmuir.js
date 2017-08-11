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
            water: WaterModel,
            wind: WindModel
        },

        defaults: {
            'obj_type': 'gnome.weatherers.Langmuir',
        },

        toTree: function(){
            return '';
        }
    });

    return langmuir;
});