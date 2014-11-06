define([
    'underscore',
    'backbone',
    'moment',
    'model/base'
], function(_, Backbone, moment, BaseModel){
    var windModel = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            timeseries: [['2014-07-07T12:00:00', [0, 0]]],
            units: 'm/s',
            obj_type: 'gnome.environment.wind.Wind'
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
        },

        toTree: function(){
            var units = this.get('units');
            var timeseries = this.get('timeseries');
            var attrs = [];

            switch (units) {
                case 'mph':
                    units = 'miles / hour';
                    break;
                case 'm/s':
                    units = 'meters / sec';
                    break;
                default:
                    units = units;
            }
            var arrayOfStrings = [];
            for (var i = 0; i < timeseries.length; i++){
                var arrayString = '[' + moment(timeseries[i][0]).format('lll') + ', Speed: ' + timeseries[i][1][0] + ', Direction: ' + timeseries[i][1][1] + ']';
                arrayOfStrings.push({title: arrayString});
            }
            attrs.push({title: 'Timeseries: [...]', expanded: false, children: arrayOfStrings});

            attrs.push({title: 'Units: ' + units, key: 'Units',
                         obj_type: this.get('units'), action: 'edit', object: this});

            return attrs;
        }
    });

    return windModel;
});