define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'text!templates/form/outputter/base.html',
    'views/modal/form',
    'views/modal/progressmodal',
    'model/cache',
    'model/outputters/kmz',
    'model/outputters/netcdf',
    'model/outputters/shape',
    'model/outputters/binary',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment,
            OutputTemplate,
            FormModal, ProgressModal,
            CacheModel, KMZModel, NetCDFModel, ShapeModel, BinaryModel) {
    'use strict';
    var outputForm = FormModal.extend({
        models: {
            'gnome.outputters.netcdf.NetCDFOutput': NetCDFModel,
            'gnome.outputters.kmz.KMZOutput': KMZModel,
            'gnome.outputters.shape.ShapeOutput': ShapeModel,
            'gnome.outputters.binary.BinaryOutput': BinaryModel
        },

        urlRoot : '/full_run_api/',

        initialize: function(options, model) {
            if (!_.isUndefined(model)) {
                this.model = model;
            }
            else {
                this.model = this.findOutputterModel();
            }

            FormModal.prototype.initialize.call(this, options);
        },

        findOutputterModel: function() {
            var model;
            var obj_type;

            if (this.title === 'KMZ Output') {
                obj_type = 'gnome.outputters.kmz.KMZOutput';
            }
            else if (this.title === 'NetCDF Output') {
                obj_type = 'gnome.outputters.netcdf.NetCDFOutput';
            }
            else if (this.title === 'Shapefile Output') {
                obj_type = 'gnome.outputters.shape.ShapeOutput';
            }
            else if (this.title === 'Binary Output') {
                obj_type = 'gnome.outputters.binary.BinaryOutput';
            }

            model = webgnome.model.get('outputters').findWhere({'obj_type': obj_type});

            if (_.isUndefined(model)) {
                model = new this.models[obj_type]();
                model.setOutputterName();
                model.setStartTime();
            }
            else {
                model.setOutputterName();
                model.setStartTime();
            }

            return model;
        },

        render: function(options) {
            var start_time = moment(this.model.get('output_start_time')).format(webgnome.config.date_format.moment);
            var output_timestep = this.model.get('output_timestep');
            var zeroStep = this.model.get('output_zero_step');
            var lastStep = this.model.get('output_last_step');

            this.body = _.template(OutputTemplate, {
                start_time: start_time,
                time_step: output_timestep,
                output_zero_step: zeroStep,
                output_last_step: lastStep
            });

            FormModal.prototype.render.call(this, options);

            this.contextualizeTime();

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
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

        update: function() {
            var output_start_time = moment(this.$('#start_time').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            var output_timestep = this.$('#time_step').val();
            var zeroStep = this.$('.zerostep').is(':checked');
            var lastStep = this.$('.laststep').is(':checked');
            var unit = this.$('#units').val();

            output_timestep = this.convertToSeconds(output_timestep, unit);

            this.model.set('output_timestep', output_timestep);
            this.model.set('output_zero_step', zeroStep);
            this.model.set('output_last_step', lastStep);
            this.model.set('output_start_time', output_start_time);

            if (this.model.isValid()) {
                this.clearError();
            }
        },

        setupProgressScreen: function(options) {

        },

        save: function(options) {
            this.progressModal = new ProgressModal({title: "Running Model..."});
            this.progressModal.render();
            this.close();
        },

        turnOff: function() {
            this.toggleOutputters(_.bind(function() {
                webgnome.cache.rewind();

                this.loadingModal.hide();
                this.removeOutputter();

                window.location.href = this.get_output_href();

                FormModal.prototype.save.call(this);
            }, this), false);
        },
        
        get_output_href: function() {
            var _href_parts = [webgnome.config.api, 'export', 'output',
                               this.model.get('obj_type')];

            if (this.model.get('obj_type') === 'gnome.outputters.netcdf.NetCDFOutput') {
                if (webgnome.model.get('uncertain') === false) {
                    // specific output file
                    _href_parts.push(this.model.get('filename'));
                }
            }
            else if (this.model.get('obj_type') === 'gnome.outputters.kmz.KMZOutput') {
                _href_parts.push(this.model.get('filename'));
            }

            return _href_parts.join('/');
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }

    });

    return outputForm;
});
