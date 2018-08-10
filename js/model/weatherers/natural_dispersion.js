define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var naturalDispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.NaturalDispersion',
            'waves': null,
            'water': null
        },

        model: {
            waves: Backbone.Model,
            water: Backbone.Model
        },

        toTree: function(){
            return '';
        }
    });

    return naturalDispersionWeatherer;
});