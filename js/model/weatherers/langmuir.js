define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water',
    'model/environment/wind',
    'model/environment/gridwind'
], function(_, Backbone, BaseModel, WaterModel, WindModel, GridWindModel){
    'use strict';
    var langmuir = BaseModel.extend({
        urlRoot: '/weatherer/',

        model: {
            wind: {'gnome.environment.wind.Wind': WindModel,
                   'gnome.environment.environment_objects.GridWind': GridWindModel},
            water: {'gnome.environment.water.Water': WaterModel}
        },

        defaults: {
            'obj_type': 'gnome.weatherers.Langmuir',
            'water': undefined,
            'wind': undefined
        },

        toTree: function(){
            return '';
        }
    });

    return langmuir;
});