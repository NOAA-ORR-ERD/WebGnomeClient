define([
    'underscore',
    'backbone',
    'model/movers/base',
    'model/environment/wind'
], function(_, Backbone, BaseModel, GnomeWind){
    'use strict';
    var windMover = BaseModel.extend({
        defaults: {
            obj_type: 'gnome.movers.wind_movers.WindMover',
            name: 'WindMover',
            active_start: '-inf',
            active_stop: 'inf'
        },

        model: {
            wind: GnomeWind
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            this.on('change:wind', this.windChange, this);
        },

        windChange: function() {
            this.listenTo(this.get('wind'), 'change:timeseries', this.triggerWindChange);
        },

        triggerWindChange: function(wind) {
            this.childChange('wind', wind);
        },

        validate: function(attrs, options){
            var uncertTimeDelay = attrs.uncertain_time_delay;
            var uncertDuration = attrs.uncertain_duration;
            var uncertAngle = attrs.uncertain_angle_scale;

            if (!isNaN(parseInt(uncertTimeDelay, 10)) && !isNaN(parseInt(uncertDuration, 10)) && !isNaN(parseInt(uncertAngle, 10))){
                if (uncertTimeDelay < 0){
                    return 'Start Time must be greater than or equal to zero!';
                }
                if (uncertDuration < 0){
                    return 'Duration must be greater than or equal to zero!';
                }
                if (uncertAngle < 0){
                    return 'Angle Scale must be greater than or equal to zero!';
                }

                if (!this.get('wind').isValid()) {
                    return this.get('wind').validationError;
                }
            } else {
                return 'All input fields must be numbers and cannot be left blank!';
            }
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var on = this.get('on');
            var name = this.get('name');
            var activeStart = this.get('active_start');
            var activeStop = this.get('active_stop');
            var uncertAngle = this.get('uncertain_angle_scale');
            var uncertDuration = this.get('uncertain_duration');
            var uncertTimeDelay = this.get('uncertain_time_delay');
            var attrs = [];

            // Ternary expressions to parse active start and stop into more human readable forms
            // if they are returned as infinity values

            activeStart = (activeStart === "-inf") ? "-infinity" : activeStart;
            activeStop = (activeStop === "inf") ? "infinity" : activeStop;

            // Ternary expressions to add time units to the returned attributes uncertain_duration
            // and uncertain_time_delay

            uncertDuration += uncertDuration === 1 ? ' hour' : ' hours';
            uncertTimeDelay += uncertTimeDelay === 1 ? ' hour' : ' hours';

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'On: ' + on, key: 'On',
                         obj_type: this.get('on'), action: 'edit', object: this});

            attrs.push({title: 'Active Start: ' + activeStart, key: 'Active Start',
                         obj_type: this.get('active_start'), action: 'edit', object: this});

            attrs.push({title: 'Active Stop: ' + activeStop, key: 'Active Stop',
                         obj_type: this.get('active_stop'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Angle Scale: ' + uncertAngle, key: 'Uncertain Angle Scale',
                         obj_type: this.get('uncertain_angle_scale'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Duration: ' + uncertDuration, key: 'Uncertain Duration',
                         obj_type: this.get('uncertain_duration'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Time Delay: ' + uncertTimeDelay, key: 'Uncertain Time Delay',
                         obj_type: this.get('uncertain_time_delay'), action: 'edit', object: this});

            tree = attrs.concat(tree);
            return tree;
        }
    });

    return windMover;
});