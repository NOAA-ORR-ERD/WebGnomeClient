define([
    'underscore',
    'backbone',
    'nucos',
    'model/weatherers/base',
    'model/environment/wind'
], function(_, Backbone, nucos, BaseModel, WindModel){
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
            
            var thicknessInMeters = nucos.convert('Length', attrs.thickness_units,
                                                  'm', attrs.thickness);
            
            if (!webgnome.model.getSubstance().get('is_weatherable')) {
                return 'Substance spilled must be an oil to calculate burn rate';
            }
            
            if (!_.isNumber(parseFloat(attrs.area)) || isNaN(parseFloat(attrs.area))){
                return "Enter a number for boomed area!";
            }
            
            if (attrs.area <= 0){
                return "Boomed area must be greater than zero!";
            }

            if (thicknessInMeters <= .002){
                return "Oil thickness is less than .002 meters. Oil will not burn.";
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