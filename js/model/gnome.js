define([
    'underscore',
    'backbone',
    'moment',
    'model/base',
    'model/map',
    'model/spill'
], function(_, Backbone, moment, BaseModel, MapModel, SpillModel){
    var gnomeModel = BaseModel.extend({
        url: '/model',
        
        defaults: {
            'outputters': null,
            'obj_type': 'gnome.model.Model',
            'weathering_substeps': null,
            'map': null,
            'movers': null,
            'start_time': Math.round(Date.now() / 1000),
            'environment': null,
            'cache_enabled': 'false',
            'weatherers': null,
            'spills': [],
            'time_step': '900',
            'duration': '86400',
            'uncertain': false,
            'id': null
        },

        model: {
            map: MapModel,
            spills: SpillModel
        },

        validate: function(attrs, options) {
            if(attrs.duration <= 0 || isNaN(attrs.duration)){
                return 'Duration values should be numbers only and greater than 0.';
            }

            if(parseInt(attrs.days, 10) === 0 && parseInt(attrs.hours, 10) === 0){
                return 'Duration length should be greater than zero.';
            }

            if(parseInt(attrs.time_step, 10) != attrs.time_step){
                return 'Time steps must be a whole number.';
            }

            // if (attrs.map_id === null) {
            //     return 'Model requires a map.';
            // }

            // if (attrs.movers === null) {
            //     return 'Model doesn\'t have any movers.';
            // }

            // if (attrs.spills === null) {
            //     return 'Model requires at least one spill.';
            // }

            // if (attrs.environment === null) {
            //     return 'Model doesn\'t have an environment.';
            // }

            // if (attrs.start_time === null || attrs.duration) {
            //     return 'Model needs both start time and duration.';
            // }
        },

        formatDuration: function() {
            var duration = this.get('duration');

            var hours = duration / 3600;
            var days = hours / 24;

            if (Math.round(days) != days) {
                if (days < 1){
                    days = 0;
                } else {
                    days = parseInt(days, 10);
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