define([
    'underscore',
    'backbone',
    'moment',
    'models/base'
], function(_, Backbone, moment, BaseModel){
    var gnomeModel = BaseModel.extend({
        url: '/model',
        
        defaults: {
            'outputters': null,
            'obj_type': 'gnome.model.Model',
            'weathering_substeps': null,
            'map_id': null,
            'movers': null,
            'start_time': Math.round(Date.now() / 1000),
            'environment': null,
            'cache_enabled': 'false',
            'weatherers': null,
            'spills': null,
            'time_step': '50',
            'duration': '86400',
            'uncertain': false,
            'id': null
        },


        validate: function(attrs, options) {
            if (attrs.map_id === null) {
                return 'Model requires a map.';
            }

            if (attrs.movers === null) {
                return 'Model doesn\'t have any movers.';
            }

            if (attrs.spills === null) {
                return 'Model requires at least one spill.';
            }

            if (attrs.environment === null) {
                return 'Model doesn\'t have an environment.';
            }

            if (attrs.start_time === null || attrs.duration) {
                return 'Model needs both start time and duration.';
            }
        },

        formatDuration: function() {
            var duration = this.get('duration');

            var hours = duration / 3600;
            var days = hours / 24;

            if (Math.round(days) != days) {
                if (days < 1){
                    days = 0;
                } else {
                    days = Math.round(days);
                    hours = hours - (days * 24);
                }
            } else {
                hours = 0;
            }
            return {days: days, hours: hours};
        },
        
    });

    return gnomeModel;
});