define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    'use strict';
    var dissolutionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.dissolution.Dissolution',
            'waves': null,
            'wind': null,
        },

        model: {
            waves:  Backbone.Model,
            wind: Backbone.Model
        },

        toTree: function(){
            return '';
        }
    });

    return dissolutionWeatherer;
});