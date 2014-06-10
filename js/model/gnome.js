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

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
            this.save(null, {validate: false});
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