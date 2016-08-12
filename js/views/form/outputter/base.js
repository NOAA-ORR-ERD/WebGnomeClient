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
            webgnome.cache.on('step:recieved', this.step, this);
            webgnome.cache.on('step:failed', this.turnOff, this);

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

        step: function() {
            webgnome.cache.step();
        },

        update: function() {
            var output_timestep = this.$('#time_step').val();
            var zeroStep = this.$('.zerostep').is(':checked');
            var lastStep = this.$('.laststep').is(':checked');

            this.model.set('output_timestep', output_timestep);
            this.model.set('output_zero_step', zeroStep);
            this.model.set('output_last_step', lastStep);
        },

        save: function(options) {
            webgnome.cache.step();
        },

        turnOff: function() {
            console.log('turn off ran');
            this.model.set('on', false);
            webgnome.cache.rewind();

            webgnome.cache.off('step:recieved', this.step, this);
            webgnome.cache.off('step:failed', this.turnOff, this);
            FormModal.prototype.save.call(this, options);
        }

    });

    return outputForm;
});