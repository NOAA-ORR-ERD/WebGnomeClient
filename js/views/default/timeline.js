define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/base',
    'flot',
    'flottime',
    'flotextents',
    'flotnavigate',
], function($, _, Backbone, moment, BaseView) {
    var timelineView = BaseView.extend({
        className: 'timeline',

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('weatherers'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('movers'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.render);
            this.listenTo(webgnome.model, 'change:start_time change:duration change:name', this.render);
        },

        render: _.debounce(function() {
            var [model_start, model_end] = webgnome.model.activeTimeRange().map(function(secs) {
                return secs * 1000;  // milliseconds
            });

            var offset = (webgnome.model.get('duration') / 12) * 1000;

            var baseline = {label: "empty",
                            data: [[model_start - offset, 0],
                                   [model_end + offset, 0]]
                            };

            var timelinedata = [{label: webgnome.model.get('name'),
                                 start: model_start,
                                 end: model_end,
                                 fillColor: '#4e79a7'},
                                ];

            // spills
            webgnome.model.get('spills').forEach(function(spill) {
                var [start, end] = spill.activeTimeRange().map(function(secs) {
                    return secs * 1000;  // milliseconds
                });

                var timeStep = webgnome.model.get('time_step') * 1000;

                end = Math.max(end, start + timeStep);

                if (start < model_start) {
                    baseline.data[0] = [start - offset, 0];
                }

                if (end > model_end) {
                    baseline.data[1] = [end + offset, 0];
                }

                var fc = '#999999';

                if (spill.get('on') !== true) {
                    fc = '#c9c9c9';
                }

                timelinedata.push({
                    label: spill.get('name'),
                    start: start,
                    end: end,
                    fillColor: fc
                });
            });

/*             webgnome.model.get('weatherers').forEach(function(weatherer) {
                // Amy: this wasn't working due to active range refactoring I think
                // right now we are only concerned with putting the cleanup
                // option weatherers on the timeline.
                if ((weatherer.get('obj_type').indexOf('cleanup') !== -1) ||
                        (weatherer.get('obj_type').indexOf('roc') !== -1)) {
                    var [start, end] = weatherer.dataActiveTimeRange().map(function(secs) {
                        return secs * 1000;  // milliseconds
                    });

                    if (start < model_start) {
                        baseline.data[0] = [start - offset, 0];
                    }

                    if (end > model_end) {
                        baseline.data[1] = [end + offset, 0];
                    }

                    timelinedata.push({
                        label: weatherer.get('name'),
                        start: start,
                        end: end,
                        fillColor: '#ffd970'
                    });
                }
            }); */

            webgnome.model.get('movers').forEach(function(mover) {
                var tmp = mover.dataActiveTimeRange({ignore_extrapolation: true});

                var [start, end] = mover.dataActiveTimeRange({ignore_extrapolation: true})
                .map(function(secs) {
                    return secs * 1000;  // milliseconds
                });

                if (start === end) {
                    end += offset / 20;  // give ourselves something to see.
                }

                var fc = 'rgba(214, 160, 255, 1.0)';

                if (mover.get('on') !== true) {
                    fc = 'rgba(214, 160, 255, 0.5)';
                }

                var mover_name = mover.get('name');

                if (mover.extrapolated() === true) {
                    mover_name += ' (extrapolated)';
                }

                timelinedata.push({
                    label: mover_name,
                    start: start,
                    end: end,
                    fillColor: "#9AC0CD",
                });
            });

            // dynamically set the height of the timeline div
            var height = (timelinedata.length * 20) + 40;
            this.$el.css('height', height + 'px');

            var timeline = {extents: { show: true },
                            data: [],
                            extentdata: timelinedata};

            this.timeline = $.plot(this.$el, [baseline, timeline], {
                legend: {
                    show: false
                },
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd'
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    tickColor: '#ddd'
                },
                yaxis: {
                    show: false
                },
                pan: {
                    interactive: true
                },
                series: {
                    extents: {
                        color: 'rgba(255, 255, 255, .25)',
                        lineWidth: 10,
                        rowHeight: 20,
                        barHeight: 20,
                        rows: timelinedata.length
                    }
                }
            });
        }, 10),
    });

    return timelineView;
});
