define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'moment',
    'flot',
    'flottime',
    'flotextents',
    'flotnavigate',
], function($, _, Backbone, BaseView, moment){
    var timelineView = BaseView.extend({
        className: 'timeline',

        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('weatherers'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('movers'), 'change add remove', this.render);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.render);
            this.listenTo(webgnome.model, 'change:start_time change:duration', this.render);
        },

        render: function(){
            var start = parseInt(moment(webgnome.model.get('start_time')).format('x'), 10);
            var end = parseInt(start + (webgnome.model.get('duration') * 1000), 10);
            var offset = (webgnome.model.get('duration') / 12) * 1000;
            var baseline = {label: "empty", data: [[start - offset, 0],[end + offset, 0]]};

            var timelinedata = [
                {label: 'Model', start: start, end: end},
            ];

            // spills
            webgnome.model.get('spills').forEach(function(spill){
                var start = parseInt(moment(spill.get('release').get('release_time')).format('x'));
                var end = Math.max(
                    parseInt(moment(spill.get('release').get('end_release_time')).format('x')),
                    parseInt(start + (webgnome.model.get('time_step') * 1000))
                );

                timelinedata.push({
                    label: spill.get('name'),
                    start: start,
                    end: end,
                    fillColor: '#FFE6A0'
                });
            });

            webgnome.model.get('weatherers').forEach(function(weatherer){
                if(weatherer.get('obj_type').indexOf('cleanup') !== -1){
                    var start = parseInt(moment(weatherer.get('active_start')).format('x'));
                    var end = parseInt(moment(weatherer.get('active_stop')).format('x'));

                    timelinedata.push({
                        label: weatherer.get('name'),
                        start: start,
                        end: end,
                        fillColor: '#FFA0A0'
                    });
                }
            });

            // general movers w/ bundle collection for inf
            var bundle = [];
            webgnome.model.get('movers').forEach(function(mover){
                if(mover.get('active_start') === '-inf' && mover.get('active_stop') === 'inf' && mover.get('obj_type') !== 'gnome.movers.wind_movers.WindMover'){
                    bundle.push(mover);
                } else if(mover.get('obj_type') !== 'gnome.movers.wind_movers.WindMover') {
                    var start, end;

                    if(mover.get('active_start') === "-inf"){
                        start = -Infinity;
                    } else {
                        start = parseInt(moment(mover.get('active_start')).format('x'));
                    }

                    if(mover.get('active_stop') === 'inf'){
                        end = Infinity;
                    } else {
                        end = parseInt(moment(mover.get('active_stop')).format('x'));
                    }

                    timelinedata.push({
                        label: mover.get('name'),
                        start: start,
                        end: end,
                        fillColor: '#D6A0FF'
                    });
                }
            });

            // windmovers and their winds
            var windmovers = webgnome.model.get('movers').where({obj_type: 'gnome.movers.wind_movers.WindMover'});
            for(var m = 0; m < windmovers.length; m++){
                var mover = windmovers[m];
                if(mover.get('active_start') === "-inf"){
                    start = -Infinity;
                } else {
                    start = parseInt(moment(mover.get('active_start')).format('x'));
                }

                if(mover.get('active_stop') === 'inf'){
                    end = Infinity;
                } else {
                    end = parseInt(moment(mover.get('active_stop')).format('x'));
                }

                timelinedata.push({
                    label: mover.get('name'),
                    start: start,
                    end: end,
                    fillColor: '#D6A0FF'
                });

                if(mover.get('wind')){
                    var wind = mover.get('wind');

                    if(wind.get('timeseries').length > 1){
                        start = moment(wind.get('timeseries')[0][0]).format('x');
                        end = moment(wind.get('timeseries')[wind.get('timeseries').length - 1][0]).format('x');
                    }

                    timelinedata.push({
                        label: mover.get('name') + ' - ' + wind.get('name'),
                        start: start,
                        end: end,
                        fillColor: 'rgba(214, 160, 255, 0.5)'
                    });
                }
            }

            // inf mover bundle
            var label = '';
            for(var i = 0; i < bundle.length; i++){
                label += bundle[i].get('name') + ', ';
            }

            if(bundle.length > 0){
                timelinedata.push({
                    start: -Infinity,
                    end: Infinity,
                    label: label,
                    fillColor: '#D6A0FF'
                });
            }

            // dynamically set the height of the timeline div
            var height = (timelinedata.length * 20) + 40;
            this.$el.css('height', height + 'px');

            var timeline = {extents: { show: true }, data: [], extentdata: timelinedata};

            this.timeline = $.plot(this.$el, [baseline,timeline], {
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
        },
    });

    return timelineView;
});