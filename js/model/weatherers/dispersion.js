define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    'use strict';
    var dispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion',
            'name': 'Dispersion',
            'efficiency': null,
            'fraction_sprayed': 0
        },

        model: {
            waves: WavesModel
        },

        validate: function(attrs, options){
            if (attrs.fraction_sprayed <= 0){
                return 'Percent of oil sprayed must be greater than zero!';
            }
        },

        toTree: function(){
            return '';
        }
    });

    return dispersionWeatherer;
});