define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var weatheringData = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.WeatheringData',
        },

        toTree: function(){
            return '';
        }
    });

    return weatheringData;
});