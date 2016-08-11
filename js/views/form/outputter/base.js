define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'text!templates/form/outputter/base.html',
    'views/modal/form',
], function($, _, Backbone, module, OutputTemplate, FormModal){
    'use strict';
    var outputForm = FormModal.extend({
        initialize: function(options, model){
            if (!_.isUndefined(model)) {
                this.model = model;
            }

            this.model.set('on', true);

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options) {
            var output_timestep = this.model.get('output_timestep');
            var zeroStep = this.model.get('output_zero_step');
            var lastStep = this.model.get('output_last_step');
            this.body = _.template(OutputTemplate, {
                time_step: output_timestep,
                output_zero_step: zeroStep,
                output_last_step: lastStep
            });

            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var output_timestep = this.$('#time_step').val();
            var zeroStep = this.$('.zerostep').is(':checked');
            var lastStep = this.$('.laststep').is(':checked');

            this.model.set('output_timestep', output_timestep);
            this.model.set('output_zero_step', zeroStep);
            this.model.set('output_last_step', lastStep);
        }

    });

    return outputForm;
});