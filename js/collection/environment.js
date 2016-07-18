define([
    'underscore',
    'backbone',
    'moment'
], function(_, Backbone, moment){
    'use strict';
    var environment = Backbone.Collection.extend({

        windCompliance: function() {
            var windData = this.findWhere({'obj_type': 'gnome.environment.wind.Wind'});
            var windArr = [];

            if (!_.isUndefined(windData)) {
                var ts = windData.get('timeseries');
                var windStart = moment(ts[0][0]).unix();
                var windEnd = moment(ts[ts.length - 1][0]).unix();

                if (windStart > modelStart || windEnd < modelEnd) {
                    var startDiff = !_.isNaN(start - modelStart) ? start - modelStart : 0;
                    var endDiff = !_.isNaN(modelEnd - end) ? modelEnd - end : 0;

                    if (startDiff > endDiff) {
                        timeDiff = parseInt(startDiff / 60, 10);
                    } else {
                        timeDiff = parseInt(endDiff / 60, 10);
                    }

                    windArr.push({name: 'wind', timeDiff: timeDiff});
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