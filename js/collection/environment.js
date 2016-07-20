define([
    'underscore',
    'backbone',
    'moment'
], function(_, Backbone, moment){
    'use strict';
    var environment = Backbone.Collection.extend({

        windCompliance: function() {
            var modelStart = moment(this.get('start_time')).unix();
            var modelEnd = moment(this.get('start_time')).add(this.get('duration'), 'm').unix();
            var windData = this.findWhere({'obj_type': 'gnome.environment.wind.Wind'});
            var windArr = [];

            if (!_.isUndefined(windData) && !_.isUndefined(windData.get('timeseries'))) {
                var ts = !_.isUndefined(windData.get('timeseries')) ? windData.get('timeseries') : [];
                var windStart = moment(ts[0][0]).unix();
                var windEnd = moment(ts[ts.length - 1][0]).unix();
                var timeDiff, startDiff;

                if (windStart !== windEnd && (windStart > modelStart || windEnd < modelEnd)) {
                    startDiff = !_.isNaN(windStart - modelStart) ? windStart - modelStart : 0;
                    var endDiff = !_.isNaN(modelEnd - windEnd) ? modelEnd - windEnd : 0;

                    if (startDiff > 0) {
                        timeDiff = parseInt(startDiff / 60, 10);
                    } else if (endDiff > 0) {
                        timeDiff = parseInt(endDiff / 60, 10);
                    }

                    timeDiff = moment.duration(timeDiff, 'minutes').humanize();

                    windArr.push({model: windData, timeDiff: timeDiff});
                } else {
                    startDiff = !_.isNaN(windStart - modelStart) ? windStart - modelStart : 0;

                    if (startDiff > 0) {
                        timeDiff = parseInt(startDiff / 60, 10);
                        timeDiff = moment.duration(timeDiff, 'minutes').humanize();
                        windArr.push({model: windData, timeDiff: timeDiff});
                    }
                }
            }

            return windArr;
        },

        getTimeInvalidModels: function() {
            var dataModels = [];
            var wind = this.windCompliance();
            dataModels = dataModels.concat(wind);

            return dataModels;
        }
    });

    return environment;
});