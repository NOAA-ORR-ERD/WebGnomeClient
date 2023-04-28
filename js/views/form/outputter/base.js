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
            this.render();
        },

        render: function(options) {
            var start_time = moment(this.model.get('output_start_time')).format(webgnome.config.date_format.moment);
            var output_timestep_hrs = this.model.get('output_timestep')/3600;
            var zeroStep = this.model.get('output_zero_step');
            var lastStep = this.model.get('output_last_step');
            var singleStep = this.model.get('output_single_step');

            var html = _.template(OutputTemplate)({
                start_time: start_time,
                output_timestep: output_timestep_hrs,
                output_zero_step: zeroStep,
                output_last_step: lastStep,
                output_single_step: singleStep
            });

            this.$el.append(html);

            this.contextualizeTime();

            BaseForm.prototype.render.call(this);

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });

            //this.$('.attributes').hide();
        },

        update: function(e) {

            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();

            if (name === 'start_time') {
                this.model.set('output_start_time', moment(value, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss'));
            }

            if (name === 'output_timestep_hrs') {
                this.model.set('output_timestep', value * 3600);
            }

            if ($(e.target).attr('type') === 'checkbox') {
                value = e.target.checked;
                this.model.set(name, value);
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
            BaseForm.prototype.close.call(this);
        }

    });

    return outputForm;
});
