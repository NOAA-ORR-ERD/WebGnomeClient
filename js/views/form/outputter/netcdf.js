define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/netcdf'
], function($, _, Backbone, module, OutputFormBase, NetCDFModel){
    'use strict';
    var netCDFOutputForm = OutputFormBase.extend({
        title: 'NetCDF Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new NetCDFModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
        },
    });

    return netCDFOutputForm;
});