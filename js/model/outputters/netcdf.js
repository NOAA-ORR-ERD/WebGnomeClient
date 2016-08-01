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
            'name': 'Outputter',
            'output_last_step': 'true',
            'output_zero_step': 'true',
            'netcdf_filename': 'Model.nc',
            'on': false
        },

        toTree: function(){
            return '';
        }
    });

    return netCDFOutputter;
});