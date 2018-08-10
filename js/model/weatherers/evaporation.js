define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water',
    'model/environment/wind'
], function(_, Backbone, BaseModel, WaterModel, WindModel){
    'use strict';
    var evaporationWeatherer = BaseModel.extend({
        urlRoot: '/weatherer/',

        model: {
            'wind': Backbone.Model,
            'water': Backbone.Model
        },

        defaults: {
            'obj_type': 'gnome.weatherers.Evaporation',
            'wind': null,
            'water': null
        },

        toTree: function(){
            return '';
        }
    });

    return evaporationWeatherer;
});