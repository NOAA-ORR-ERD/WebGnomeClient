define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    'use strict';
    var dissolutionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Dissolution',
            'name': 'Dissolution'
        },

        model: {
            waves: WavesModel
        },

        toTree: function(){
            return '';
        }
    });

    return dissolutionWeatherer;
});