define([
    'underscore',
    'backbone',
    'moment',
    'model/base',
    'model/fileoutput'
], function(_, Backbone, moment, BaseModel, FileOutputModel){
    'use strict';
    var fileOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'output_last_step': true,
            'output_zero_step': true,
            'on': false,
            'output_timestep': 900
        },

        initialize: function(options) {
            if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                this.setStartTime();
                this.setOutputterName();

                webgnome.model.on('change:name', this.setOutputterName, this);
            }
            BaseModel.prototype.initialize.call(this, options);
        },

        fetchFile: function() {
            var obj_type = this.get('obj_type');
            var fileOutputModel = new FileOutputModel({'obj_type': obj_type});

            fileOutputModel.fetch({
                success: function(model, status, xhr) {
                    console.log(model);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },

        setOutputterName: function(model) {
            var ext = this.get('name').split('.').pop();
            var name = _.isUndefined(model) ? webgnome.model.get('name') : model.get('name');

            name = name.replace(/ /g, "_");

            this.set('name', name + '.' + ext);
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
            } else if (time_step_secs % 60 === 0) {
                timeInfo.amount = time_step_secs / 60;
                timeInfo.unit = 'min';
            } else {
                timeInfo.amount = time_step_secs;
                timeInfo.unit = 's';
            }

            return timeInfo;
        },

        validate: function(attrs, options) {
            if (attrs.output_timestep <= 0) {
                return 'Output timestep must be greater than zero!';
            }

            if (moment(attrs.output_start_time).isBefore(webgnome.model.get('start_time'))) {
                return 'Output start time cannot be before model start time!';
            }
        },

        toTree: function(){
            return '';
        }
    });

    return fileOutputter;
});