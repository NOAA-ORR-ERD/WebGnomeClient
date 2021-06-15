define([
    'underscore',
    'backbone',
    'model/outputters/file_outputter'
], function(_, Backbone, FileOutputterModel){
    'use strict';
    var netCDFOutputter = FileOutputterModel.extend({
        urlRoot: '/outputter/',

        defaults: function() {
            var zip_output = true;
            if (webgnome.model.get('uncertain') === true) {
                zip_output = true;
            }
            else {
                zip_output = false;
            }
            return _.defaults({
                'obj_type': 'gnome.outputters.netcdf.NetCDFOutput',
                'filename': 'gnome_output.nc',
                'output_timestep': 3600,
                'zip_output': zip_output,
                'name': 'NetCDFOutput'
            }, FileOutputterModel.prototype.defaults);
        },

        toTree: function(){
            return '';
        }
    });

    return netCDFOutputter;
});