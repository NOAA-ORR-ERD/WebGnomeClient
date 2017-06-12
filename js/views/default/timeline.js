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
            var model_start = parseInt(moment(webgnome.model.get('start_time')).format('x'), 10);
            var model_end = parseInt(model_start + (webgnome.model.get('duration') * 1000), 10);
            var offset = (webgnome.model.get('duration') / 12) * 1000;
            var baseline = {label: "empty", data: [[model_start - offset, 0],[model_end + offset, 0]]};

            var timelinedata = [
                {label: 'Model', start: model_start, end: model_end, fillColor: '#9A9EAB'},
            ];

            // spills
            webgnome.model.get('spills').forEach(function(spill){
                var start = parseInt(moment(spill.get('release').get('release_time')).format('x'), 10);
                var end = Math.max(
                    parseInt(moment(spill.get('release').get('end_release_time')).format('x'), 10),
                    parseInt(start + (webgnome.model.get('time_step') * 1000), 10)
                );
                
                if (start < model_start) {
                    baseline.data[0] = [start - offset, 0];
                }
                if (end > model_end) {
                baseline.data[1] = [end + offset, 0];
                }

                var fc = '#f9563e';
                if (spill.get('on') !== true) {
                    fc = '#fc9585';
                }
                timelinedata.push({
                    label: spill.get('name'),
                    start: start,
                    end: end,
                    fillColor: fc
                });
            });

            webgnome.model.get('weatherers').forEach(function(weatherer){
                if(weatherer.get('obj_type').indexOf('cleanup') !== -1){
                    var start = parseInt(moment(weatherer.get('active_start')).format('x'), 10);
                    var end = parseInt(moment(weatherer.get('active_stop')).format('x'), 10);
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
            });

            
            webgnome.model.get('movers').forEach(function(mover){
                
                var start;
                var end;
                
                if(mover.get('real_data_start') === "-inf"){
                   start = -Infinity;
                } else {
                    start = parseInt(moment(mover.get('real_data_start')).format('x'), 10);
                }

                if(mover.get('real_data_stop') === 'inf'){
                    end = Infinity;
                } else {
                    end = Math.max(
                        parseInt(moment(mover.get('real_data_stop')).format('x'), 10),
                        parseInt(start + (webgnome.model.get('time_step') * 1000), 10)
                    );
                }
                 
                 
                var name = mover.get('name');
                
                if(mover.get('obj_type') === 'gnome.movers.wind_movers.WindMover'){
                    var wind = mover.get('wind');
                    name = wind.get('name');
                }
                    
                var fc = '#D6A0FF';
                if (mover.get('on') !== true) {
                    fc = 'rgba(214, 160, 255, 0.5)';
                }
                
                timelinedata.push({
                    label: name,
                    start: start,
                    end: end,
                    fillColor: fc
                });
            });


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