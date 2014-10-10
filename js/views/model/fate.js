define([
    'jquery',
    'underscore',
    'backbone',
    'model/step',
    'text!templates/model/fate.html',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotcrosshair',
    'flotpie'
], function($, _, Backbone, StepModel, FateTemplate){
    var fateView = Backbone.View.extend({
        step: new StepModel(),
        className: 'fate',
        frame: 0,

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(FateTemplate);
            this.$el.html(compiled);
            $.get(webgnome.config.api + '/rewind');
            this.renderTimeline();
        },

        renderTimeline: function(){
            this.buildDataset(_.bind(function(dataset){
                this.timelinePlot = $.plot('.fate .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                        hoverable: true,
                        autoHighlight: false
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        stack: true,
                        group: true,
                        groupInterval: 1,
                        lines: {
                            show: true,
                            fill: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    },
                    crosshair: {
                        mode: 'x',
                    }
                });
    
                this.renderPiesTimeout = null;
                this.$('.timeline .chart').on('plothover', _.bind(this.timelineHover, this));
            }, this));
        },

        buildDataset: function(cb){
            if(this.frame < webgnome.model.get('num_time_steps')){
                this.step.fetch({
                    success: _.bind(function(){
                        if(this.step){
                            this.frame++;
                            this.buildDataset(cb);
                            this.formatDataset(this.step);
                            cb(this.dataset);
                        }
                    }, this)
                });
            }
        },

        formatDataset: function(step){
            var mass = step.get('WeatheringOutput').mass_balance;
            if(_.isUndefined(this.dataset)){
                this.dataset = [];
                var titles = _.clone(mass);
                delete titles.step_num;
                delete titles.time;
                var keys = Object.keys(titles);
                for(var type in keys){
                    this.dataset.push({
                        data: [],
                        label: this.formatLabel(keys[type]),
                        name: keys[type]
                    });
                }
                // this.dataset.push({
                //     data: [],
                //     label: 'Evaporation',
                //     name: 'evaporation'
                // });
            }

            var date = moment(mass.time);
            for(var set in this.dataset){
                this.dataset[set].data.push([date.unix() * 1000, mass[this.dataset[set].name]]);
            }
            // this.dataset[1].data[this.dataset[1].data.length - 1][1] = Math.random() * 2000;
        },

        timelineHover: function(e, pos, item){
            if(!this.renderPiesTimeout){
                this.pos = pos;
                this.renderPiesTimeout =  setTimeout(_.bind(function(){
                    this.renderPies();
                }, this), 50);
            }
        },

        renderPies: function(){
            this.renderPiesTimeout = null;
            var i, j;
            var dataset = this.dataset;
            var pos = this.pos;
            var meanData = [];
            for (i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                for (j = 0; j < series.data.length; ++j) {
                    if (series.data[j][0] > pos.x) {
                        break;
                    }
                }

                var y,
                    p1 = series.data[j - 1],
                    p2 = series.data[j];

                if (p1 === null) {
                    y = p2[1];
                } else if (p2 === null) {
                    y = p1[1];
                } else {
                    y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                }

                meanData.push({label: this.formatLabel(series.name), data: y});
            }

            var chartOptions = {
                series: {
                    pie: {
                        show: true,
                        stroke: {
                            width: 0
                        }
                    }
                },
                legend: {
                    show: false
                }
            };

            this.meanPlot = $.plot('.fate .mean', meanData, chartOptions);
        },

        formatLabel: function(label){
            return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ');
        },

        close: function(){
            this.step = null;
            Backbone.View.prototype.close.call(this);
        }
    });

    return fateView;
});