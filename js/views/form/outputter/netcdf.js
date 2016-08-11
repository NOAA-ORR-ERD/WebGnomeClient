define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'text!templates/form/outputter/netcdf.html',
    'views/modal/form',
], function($, _, Backbone, module, NetCDFOutputTemplate, FormModal){
    'use strict';
    var netCDFOutputForm = FormModal.extend({
        title: 'NetCDF Output',
        initialize: function(options, model){
            if (!_.isUndefined(model)) {
                this.model = model;
            }

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options) {
            var output_timestep = this.model.get('output_timestep');
            var zeroStep = this.model.get('output_zero_step');
            var lastStep = this.model.get('output_last_step');
            this.body = _.template(NetCDFOutputTemplate, {
                time_step: output_timestep,
                output_zero_step: zeroStep,
                output_last_step: lastStep
            });

            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            
        }
    });

    return netCDFOutputForm;
});