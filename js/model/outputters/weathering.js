define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var weatheringOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.weathering.WeatheringOutput',
            'output_timestep': null,
            'output_last_step': 'true',
            'output_zero_step': 'true',
        },

        toTree: function(){
            return '';
        }
    });

    return weatheringOutputter;
});