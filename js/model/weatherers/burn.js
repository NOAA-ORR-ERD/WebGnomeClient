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
            'active_range': ['-inf', 'inf'],
            'area': 0,
            'thickness': 0,
            'area_units': 'm^2',
            'thickness_units': 'cm',
            'wind': null,
            'water': null,
            'efficiency': 0.20
        },

        model: {
            wind: Backbone.Model,
            water: Backbone.Model
        },

        toTree: function(){
            return '';
        },

        validate: function(attrs, options){
            if (!_.isNumber(parseFloat(attrs.area)) || isNaN(parseFloat(attrs.area))){
                return "Enter a number for boomed area!";
            }
            
            if (attrs.area <= 0){
                return "Boomed area must be greater than zero!";
            }

            if (!_.isNumber(parseFloat(attrs.thickness)) || isNaN(parseFloat(attrs.thickness))){
                return "Enter a number for thickness!";
            }
            if (attrs.thickness <= 0){
                return "Thickness must be greater than zero!";
            }
        }
    });

    return burnWeatherer;
});