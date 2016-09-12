define([
    'underscore',
    'backbone',
    'moment',
    'sweetalert'
], function(_, Backbone, moment, swal){
    'use strict';
    var movers = Backbone.Collection.extend({

        convertToMinutes: function(secs) {
            return parseInt(secs / 60, 10);
        },

        findValidTimeInterval: function() {
            var obj = {};
            this.each(_.bind(function(el, i, collection){
                var validType = _.isNull('[RandomMover|GridCurrentMover|GridWindMover|WindMover|CatsMover]'.match(el.parseObjType())) ? true : false;
                if (!el.get('extrapolate') && el.get('on') && validType) {
                    if ((_.isUndefined(obj.start) && _.isUndefined(obj.end)) || (el.get('real_data_start') >= obj.start && el.get('real_data_stop') <= obj.end)) {
                            obj.start = el.get('real_data_start');
                            obj.end = el.get('real_data_stop');
                        } else {
                            swal({
                                title: 'Movers cannot be reconciled!',
                                text: 'The mover: ' + el.get('name') + ' does not fall in the runtime of the previous movers ' +
                                    '. You will need to either turn off this mover or extrapolate.',
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Select Option',
                                cancelButtonText: 'Cancel'
                            }).then(_.bind(function(option){
                                if (option) {
                                    swal({
                                        title: 'Choose correction option',
                                        text: 'Select whether to turn off or extrapolate mover: ' + el.get('name') + '.',
                                        type: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Turn Off',
                                        cancelButtonText: 'Extrapolate'
                                    }).then(_.bind(function(turn_off){
                                        if (turn_off) {
                                            el.set('on', false);
                                        } else {
                                            el.set('extrapolate', true);
                                        }
                                    }, this));
                                }
                            }, this));
                        }
                    }
            }, this));

            return obj;
        },

        getTimeInvalidModels: function() {
            var invalidModels = [];
            var modelStart = moment(this.get('start_time')).unix();
            var modelEnd = moment(this.get('start_time')).add(this.get('duration'), 'm').unix();

            this.each(_.bind(function(el, i, col){
                if (!el.get('extrapolate') && (el.get('active_start') !== '-inf' || el.get('active_stop') !== 'inf')) {
                    var start = moment(el.get('active_start')).unix();
                    var end = moment(el.get('active_stop')).unix();

                    if (start > modelStart || end < modelEnd) {
                        var timeDiff;
                        var startDiff = !_.isNaN(start - modelStart) ? start - modelStart : 0;
                        var endDiff = !_.isNaN(modelEnd - end) ? modelEnd - end : 0;

                        if (startDiff > 0) {
                            timeDiff = this.convertToMinutes(startDiff);
                        } else if (endDiff > 0) {
                            timeDiff = this.convertToMinutes(endDiff);
                        }

                        timeDiff = moment.duration(timeDiff, 'minutes').humanize();

                        invalidModels.push({model: el, timeDiff: timeDiff});
                    }
                }
            }, this));

            return invalidModels;
        }
    });

    return movers;
});