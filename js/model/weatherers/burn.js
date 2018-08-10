define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/wind'
], function(_, Backbone, BaseModel, WindModel){
    'use strict';
    var burnWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.Burn',
            'name': 'Burn',
            'area': 0,
            'thickness': 0,
            'area_units': 'm^2',
            'thickness_units': 'cm',
            'wind': null,
            'efficiency': 0.20
        },

        model: {
            wind: Backbone.Model
        },

        toTree: function(){
            return '';
        },

        validate: function(attrs, options){
            if (!_.isNumber(parseFloat(attrs.area)) || isNaN(parseFloat(attrs.area))){
                return "Enter a number for boomed area!";
            }
            
            if (!_.isNumber(parseFloat(attrs.thickness)) || isNaN(parseFloat(attrs.thickness))){
                return "Enter a number for thickness!";
            }
        }
    });

    return burnWeatherer;
});