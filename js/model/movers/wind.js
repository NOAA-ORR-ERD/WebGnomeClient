define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/wind'
], function(_, Backbone, BaseModel, GnomeWind){
    var windMover = BaseModel.extend({
        urlRoot: '/movers/',

        defaults: {
            obj_type: 'gnome.movers.wind_movers.WindMover'
        },

        model: {
            wind: GnomeWind
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

            activeStart = activeStart === "-inf" ? "-infinity" : activeStart;
            activeStop = activeStop === "inf" ? "infinity" : activeStop;

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