define([
    'underscore',
    'backbone',
    'moment',
    'model/base'
], function(_, Backbone, moment, BaseModel){
    var windModel = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            timeseries: [[0, [0, 0]]],
            units: 'm/s'
        },

        validate: function(attrs, options){
            if(!_.isUndefined(attrs.timeseries)) {
                var msg;
                _.each(attrs.timeseries, function(el, ind, arr){
                    if(el[1][0] < 0){
                        msg = 'Speed must be greater than or equal to 0';
                    }

                    if(el[1][1] < 0 || el[1][1] > 360){
                        msg = 'Direction must be between 0 and 360 degrees';
                    }
                });
                if (msg) {
                    return msg;
                }
            }

            if (_.isUndefined(attrs.units)) {
                return 'Speed unit definition is required.';
            }
        },

        sortTimeseries: function(){
            var ts = _.sortBy(this.get('timeseries'), function(entry){
                return moment(entry[0]).unix();
            });
            this.set('timeseries', ts);
        }
    });

    return windModel;
});