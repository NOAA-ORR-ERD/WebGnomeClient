define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WaterModel, WavesModel){
    'use strict';
    var naturalDispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.NaturalDispersion',
            'waves': undefined,
            'water': undefined
        },

        model: {
            waves: {'gnome.environment.waves.Waves': WavesModel},
            water: {'gnome.environment.water.Water': WaterModel}
        },

        toTree: function(){
            return '';
        }
    });

    return naturalDispersionWeatherer;
});