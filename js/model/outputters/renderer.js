define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var rendererOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.renderer.Renderer',
            'name': 'netCDF',
            'output_last_step': 'true',
            'output_zero_step': 'true',
            'netcdf_filename': 'Model.nc',
            'on': false
        },

        toTree: function(){
            return '';
        }
    });

    return rendererOutputter;
});