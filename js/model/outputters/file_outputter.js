define([
    'underscore',
    'backbone',
    'moment',
    'model/base'
], function(_, Backbone, moment, BaseModel) {
    'use strict';
    var fileOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'output_last_step': true,
            'output_zero_step': true,
            'on': true,
            'output_timestep': 900,
            'name': 'FileOutputter'
        },

        initialize: function(options) {
            if (_.has(window, 'webgnome') &&
                    _.has(webgnome, 'model') &&
                    !_.isNull(webgnome.model)) {
                this.setStartTime();
                this.setOutputterName(options);

                webgnome.model.on('change:name', this.setOutputterName, this);
            }

            BaseModel.prototype.initialize.call(this, options);
        },

        setOutputterName: function(options) {
            var model = webgnome.model;
            var ext = this.get('name').split('.').pop();
            var name;

            if (_.isUndefined(options)) {
                name = model.get('name').replace(/ /g, "_") + '.' + ext;
            } else {
                if(_.isUndefined(options.name)){
                    name = this.get('name');
                } else {
                    name = options.name;

                }
            }

            this.set('name', name);
        },

        setStartTime: function() {
            var start_time = webgnome.model.get('start_time');

            this.set('output_start_time', start_time);
        },

        timeConversion: function() {
            var timeInfo = {};
            var time_step_secs = this.get('output_timestep');

            if (time_step_secs % 3600 === 0) {
                timeInfo.amount = time_step_secs / 3600;
                timeInfo.unit = 'hr';
            }
            else if (time_step_secs % 60 === 0) {
                timeInfo.amount = time_step_secs / 60;
                timeInfo.unit = 'min';
            }
            else {
                timeInfo.amount = time_step_secs;
                timeInfo.unit = 's';
            }

            return timeInfo;
        },

        validate: function(attrs, options) {
            if (attrs.output_timestep <= 0) {
                return 'Output timestep must be greater than zero!';
            }

            if (moment(attrs.output_start_time)
                    .isBefore(webgnome.model.get('start_time'))) {
                return 'Output start time cannot be before model start time!';
            }
        },

        toTree: function() {
            return '';
        }
    });

    return fileOutputter;
});
