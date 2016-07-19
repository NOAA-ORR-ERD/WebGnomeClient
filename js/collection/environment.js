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
                var timeDiff;

                if (windStart > modelStart || windEnd < modelEnd) {
                    var startDiff = !_.isNaN(windStart - modelStart) ? windStart - modelStart : 0;
                    var endDiff = !_.isNaN(modelEnd - windEnd) ? modelEnd - windEnd : 0;

                    if (startDiff > endDiff) {
                        timeDiff = parseInt(startDiff / 60, 10);
                    } else {
                        timeDiff = parseInt(endDiff / 60, 10);
                    }

                    windArr.push({model: windData, timeDiff: timeDiff});
                }
            }

            return windArr;
        },

        areDataValid: function() {
            var dataModels = [];
            var wind = this.windCompliance();
            dataModels = dataModels.concat(wind);

            return dataModels;
        }
    });

    return environment;
});