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

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            if (!_.isUndefined(webgnome.model) && !_.isNull(this.get('output_start_time'))) {
                var start_time = webgnome.model.get('start_time');
                this.set('output_start_time', start_time);
            }
        },

        toTree: function(){
            return '';
        }
    });

    return netCDFOutputter;
});