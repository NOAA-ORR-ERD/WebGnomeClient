define([
    'underscore',
    'backbone',
    'moment'
], function(_, Backbone, moment){
    'use strict';
    var movers = Backbone.Collection.extend({

        convertToMinutes: function(secs) {
            return parseInt(secs / 60, 10);
        },

        getTimeInvalidModels: function() {
            var invalidModels = [];
            var modelStart = moment(this.get('start_time')).unix();
            var modelEnd = moment(this.get('start_time')).add(this.get('duration'), 'm').unix();

            this.each(_.bind(function(el, i, col){
                if (el.get('active_start') !== '-inf' || el.get('active_stop') !== 'inf') {
                    var start = moment(el.get('active_start')).unix();
                    var end = moment(el.get('active_stop')).unix();

                    if (start > modelStart || end < modelEnd) {
                        var timeDiff;
                        var startDiff = !_.isNaN(start - modelStart) ? start - modelStart : 0;
                        var endDiff = !_.isNaN(modelEnd - end) ? modelEnd - end : 0;

                        if (startDiff > endDiff) {
                            timeDiff = this.convertToMinutes(startDiff);
                        } else {
                            timeDiff = this.convertToMinutes(endDiff);
                        }

                        invalidModels.push({model: el, timeDiff: timeDiff});
                    }
                }
            }, this));

            return invalidModels;
        }
    });

    return movers;
});