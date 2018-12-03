define([
    'underscore',
    'backbone',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    'use strict';
    var emulsificationWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Emulsification',
            'waves': null
        },

        model: {
            waves: Backbone.Model
        },

        toTree: function(){
            return '';
        }
    });

    return emulsificationWeatherer;
});