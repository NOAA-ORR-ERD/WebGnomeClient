define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var kmzOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.kmz.KMZOutput',
            'name': 'Model',
            'output_last_step': 'true',
            'output_zero_step': 'true',
            'filename': 'Model.kmz',
            'on': false,
            'output_timestep': 900
        },

        toTree: function(){
            return '';
        }
    });

    return kmzOutputter;
});