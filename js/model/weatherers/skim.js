define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/water'
], function(_, Backbone, BaseModel, WaterModel) {
    'use strict';
    var skimWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.Skimmer',
            'name': 'Skimmer',
            'active_range': ['-inf', 'inf'],
            'efficiency': 0.20,
            'amount': 0,
            'units': 'bbl',
            'water': undefined
        },

        model: {
            water: {'gnome.environment.water.Water': WaterModel}
        },

        toTree: function() {
            return '';
        },

        validate: function(attrs, options){
            if (attrs.active_range[0] === attrs.active_range[1]) {
                return "Duration must be input!";
            }
            
            if (!_.isNumber(parseFloat(attrs.amount)) ||
                    isNaN(parseFloat(attrs.amount))) {
                return "Recovery amount must be a number!";
            }

            if (attrs.amount <= 0){
                return "Recovery amount must be greater than zero!";
            }
        }
    });

    return skimWeatherer;
});
