define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel) {
    'use strict';
    var skimWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.Skimmer',
            'name': 'Skimmer',
            'efficiency': 0.20,
            'amount': 0,
            'units': 'bbl',
            'water': null
        },

        model: {
            'water': Backbone.Model
        },

        toTree: function() {
            return '';
        },

        validate: function(attrs, options){
            if (attrs.active_range[0] === attrs.active_range[1]) {
                return "Duration must be inputted!";
            }
            
            if (!_.isNumber(parseFloat(attrs.amount)) ||
                    isNaN(parseFloat(attrs.amount))) {
                return "Recovery amount must be a number!";
            }
        }
    });

    return skimWeatherer;
});
