define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var netCDFOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.netcdf.NetCDFOutput',
            'name': 'netCDF',
            'output_last_step': 'true',
            'output_zero_step': 'true',
            'netcdf_filename': 'Model.nc',
            'on': false,
            'output_timestep': 900
        },

        toTree: function(){
            return '';
        }
    });

    return netCDFOutputter;
});