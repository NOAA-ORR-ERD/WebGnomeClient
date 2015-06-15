define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var naturalDispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.NaturalDispersion',
            'name': 'Natural Dispersion'
        },

        toTree: function(){
            return '';
        }
    });

    return naturalDispersionWeatherer;
});