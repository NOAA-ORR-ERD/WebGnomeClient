define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'text!templates/form/outputter/base.html',
    'views/form/base',
    'model/cache',
    'model/outputters/kmz',
    'model/outputters/netcdf',
    'model/outputters/shape',
    'model/outputters/binary',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment,
            OutputTemplate,
            BaseForm, ProgressModal,
            CacheModel, KMZModel, NetCDFModel, ShapeModel, BinaryModel) {
    'use strict';
    var outputForm = BaseForm.extend({


        initialize: function(options, model) {
            BaseForm.prototype.initialize.call(this, options);
            if (this.model.get('output_timestep') < webgnome.model.get('time_step')) {
                this.model.set('output_timestep', webgnome.model.get('time_step'));
            }
            this.render();
            // If the model changes, rerender
            this.model.on('change', this.render, this);
        },

        render: function(options) {
            var start_time = moment(this.model.get('output_start_time')).format(webgnome.config.date_format.moment);
            var output_timestep_hrs = (parseInt(this.model.get('output_timestep'))/3600).toFixed(2);
            var zeroStep = this.model.get('output_zero_step');
            var lastStep = this.model.get('output_last_step');
            var singleStep = this.model.get('output_single_step');
            var time_step_min = (parseInt(webgnome.model.get('time_step'))/3600).toFixed(2);
            var model_steps_per_output_step = Math.round(parseInt(this.model.get('output_timestep')) / parseInt(webgnome.model.get('time_step')));

            var html = _.template(OutputTemplate)({
                start_time: start_time,
                output_timestep: output_timestep_hrs,
                output_zero_step: zeroStep,
                output_last_step: lastStep,
                output_single_step: singleStep,
                time_step_min: time_step_min,
                model_steps_per_output_step: model_steps_per_output_step,
                tz_select: this.genTimeZoneSelect(),
                timeoffset: webgnome.model.get('timezone_offset'),
            });

            this.$el.html(html);

            this.contextualizeTime();

            BaseForm.prototype.render.call(this);
            
            if (_.isNull(webgnome.model.get('timezone_offset').offset)) {
                this.$('#timezone_select').removeClass('hide');
            }

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                onChangeDateTime: _.bind(function(dp,$input){
                    this.model.set('output_start_time',
                                   moment($input.val(),
                                          webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss'));
                }, this)
            });
        },

        blur: function(e) {
            BaseForm.prototype.blur.call(this, e);
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();

            if (name === 'start_time') {
                this.model.set('output_start_time', moment(value, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss'));
            }
        },

        update: function(e) {
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();

            if (!['start_time'].includes(name)) {
                BaseForm.prototype.update.call(this, e);
            }

            if (name === 'output_timestep_hrs') {
                // If it looks like a valid number we try to make sure it looks
                // sane (i.e. greater than 0 and at least the model step
                var timestep = parseFloat(value);
                if (!isNaN(timestep)) {
                    if ((timestep * 3600) >= webgnome.model.get('time_step')) {
                        // Make sure that the final output saved in the model is int
                        this.model.set('output_timestep', parseInt(timestep * 3600));
                    } else {
                        // If they are trying to set below the min timestep value... clamp it.
                        this.model.set('output_timestep', parseInt(webgnome.model.get('time_step')));
                    }
                } else {
                    // If we got something that is not a float, we try to default it to
                    // something meaningful
                    if (webgnome.model.get('time_step') > 3600) {
                        // If the model step is greater than an hour, set to the model step
                        this.model.set('output_timestep', parseInt(webgnome.model.get('time_step')));
                    } else {
                        // Else if its less than an hour, default to a 1 hour output
                        this.model.set('output_timestep', 3600);
                    }
                }
            }

            if ($(e.target).attr('type') === 'checkbox') {
                value = e.target.checked;
                this.model.set(name, value);
                // If we have a change to/from single step... we have to adjust the
                // other options to conform
                if (name === 'output_single_step') {
                    if (value === true) {
                        this.$('input[name="output_zero_step"]')[0].checked = false;
                        this.$('input[name="output_last_step"]')[0].checked = false;
                        this.$('input[name="output_timestep_hrs"]')[0].disabled = true;

                        this.model.set('output_zero_step', false);
                        this.model.set('output_last_step', false);
                    }
                    else {
                        this.$('input[name="output_zero_step"]')[0].checked = true;
                        this.$('input[name="output_last_step"]')[0].checked = true;
                        this.$('input[name="output_timestep_hrs"]')[0].disabled = false;

                        this.model.set('output_zero_step', true);
                        this.model.set('output_last_step', true);
                    }
                }
            }

        },

        contextualizeTime: function() {
            var timeInfo = this.model.timeConversion();

            this.$('#time_step').val(timeInfo.amount);
            this.$('#units').val(timeInfo.unit);
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

        save: function(options) {
            this.progressModal = new ProgressModal({title: "Running Model..."});
            this.progressModal.render();
            this.close();
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            this.$('#start_time').datetimepicker('destroy');
            BaseForm.prototype.close.call(this);
        }

    });

    return outputForm;
});
