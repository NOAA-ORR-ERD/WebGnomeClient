define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves',
    'model/environment/wind',
    'model/environment/gridwind'
], function(_, Backbone, BaseModel, WavesModel, WindModel, GridWindModel){
    'use strict';
    var dissolutionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.dissolution.Dissolution',
            'waves': undefined,
            'wind': undefined,
        },

        model: {
            waves:  {'gnome.environment.waves.Waves': WavesModel},
            wind: {'gnome.environment.wind.Wind': WindModel,
                   'gnome.environment.environment_objects.GridWind': GridWindModel},
        },

        toTree: function(){
            return '';
        }
    });

    return dissolutionWeatherer;
});