define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'text!templates/form/outputter/base.html',
    'views/modal/form',
    'views/modal/loading',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, OutputTemplate, FormModal, LoadingModal){
    'use strict';
    var outputForm = FormModal.extend({
        initialize: function(options, model){
            if (!_.isUndefined(model)) {
                this.model = model;
            }

            this.model.set('on', true);
            this.model.save();
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

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
        },

        step: function() {
            webgnome.cache.step();
        },

        convertToSeconds: function(duration, unit) {
            switch (unit){
                case "s":
                    break;
                case "min":
                    duration *= 60;
                    break;
                case "hr":
                    duration *= 3600;
                    break;
            }

            return duration;
        },

        update: function() {
            var output_timestep = this.$('#time_step').val();
            var zeroStep = this.$('.zerostep').is(':checked');
            var lastStep = this.$('.laststep').is(':checked');
            var unit = this.$('#units').val();

            output_timestep = this.convertToSeconds(output_timestep, unit);

            this.model.set('output_timestep', output_timestep);
            this.model.set('output_zero_step', zeroStep);
            this.model.set('output_last_step', lastStep);
        },

        save: function(options) {
            webgnome.cache.step();
            this.hide();
            this.loadingModal = new LoadingModal({title: "Running Model..."});
            this.loadingModal.render();
        },

        turnOff: function() {
            this.model.set('on', false);
            webgnome.cache.rewind();
            webgnome.cache.off('step:recieved', this.step, this);
            webgnome.cache.off('step:failed', this.turnOff, this);
            this.loadingModal.close();
            FormModal.prototype.save.call(this);
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }

    });

    return outputForm;
});