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

        events: {
            'shown.bs.tab': 'renderGraphs'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(FateTemplate);
            this.$el.html(compiled);
            $.get(webgnome.config.api + '/rewind');
            this.renderLoop();
        },

        renderLoop: function(){
            if(_.isUndefined(this.dataset)){
                this.buildDataset(_.bind(function(dataset){
                    this.renderGraphs();
                }, this));
            } else {
                this.renderGraphs();
            }
        },

        renderGraphs: function(){
            // find active tab and render it's graph.
            var active = this.$('.active a').attr('href');
            if(active == '#budget-graph'){
                this.renderGraphOilBudget(this.dataset);
            } else if(active == '#budget-chart') {
                
            }
        },

        renderGraphOilBudget: function(dataset){
            this.timelinePlot = $.plot('#budget-graph .timeline .chart', dataset, {
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
                    color: '#999'
                }
            });

            this.renderPiesTimeout = null;
            this.$('#budget-graph .timeline .chart').on('plothover', _.bind(this.timelineHover, this));
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
            var nominal = step.get('WeatheringOutput').nominal;
            var high = step.get('WeatheringOutput').high;
            var low = step.get('WeatheringOutput').low;

            if(_.isUndefined(this.dataset)){
                this.dataset = [];
                var titles = _.clone(nominal);
                delete titles.avg_density;
                delete titles.amount_released;
                var keys = Object.keys(titles);
                for(var type in keys){
                    this.dataset.push({
                        data: [],
                        high: [],
                        low: [],
                        label: this.formatLabel(keys[type]),
                        name: keys[type]
                    });
                }
            }

            var date = moment(step.get('WeatheringOutput').time_stamp);
            var units = webgnome.model.get('spills').at(0).get('units');

            for(var set in this.dataset){
                var value;
                if(['cubic meters', 'gal', 'bbl'].indexOf(units) !== -1){
                    // value = nucos.convert('Volume', 'kg', units, nominal[this.dataset[set].name]);
                } else {
                    // value = nucos.OilQuantityConvert().toVolume('');
                }

                low_value = low[this.dataset[set].name];
                this.dataset[set].low.push([date.unix() * 1000, low_value]);

                nominal_value = nominal[this.dataset[set].name];
                this.dataset[set].data.push([date.unix() * 1000, nominal_value]);

                high_value = high[this.dataset[set].name];
                this.dataset[set].high.push([date.unix() * 1000, high_value]);
            }
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
            var lowData = this.getPieData(pos, dataset, 'low');
            var nominalData = this.getPieData(pos, dataset, 'data');
            var highData = this.getPieData(pos, dataset, 'high');

            var chartOptions = {
                series: {
                    pie: {
                        show: true,
                        stroke: {
                            width: 0
                        },
                        label: {
                            formatter: _.bind(function(label, series){
                                var units = webgnome.model.get('spills').at(0).get('units');
                                return '<div><span style="background:' + series.color + ';"></span>' + label + '<br>' + this.formatNumber(Math.round(series.data[0][1])) + ' ' + units + ' (' + Math.round(series.percent) + '%)</div>';
                            }, this),
                            radius: 3/4
                        }
                    }
                },
                legend: {
                    show: false
                }
            };

            // possibly rewrite this part to update the data set and redraw the chart
            // might be more effecient than completely reinitalizing
            if(nominalData.length > 0){
                this.lowPlot = $.plot('.fate .minimum', lowData, chartOptions);
                this.nominalPlot = $.plot('.fate .mean', nominalData, chartOptions);
                this.highPlot = $.plot('.fate .maximum', highData, chartOptions);
            }
        },

        getPieData: function(pos, dataset, key){
            d = [];
            for (i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                for (j = 0; j < series[key].length; ++j) {
                    if (series[key][j][0] > pos.x) {
                        break;
                    }
                }

                var y,
                    p1 = series[key][j - 1],
                    p2 = series[key][j];

                if(!_.isUndefined(p1) && !_.isUndefined(p2)){
                    if (p1 === null) {
                        y = p2[1];
                    } else if (p2 === null) {
                        y = p1[1];
                    } else {
                        y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                    }
                    
                    d.push({label: this.formatLabel(series.name), data: y});
                }
            }
            return d;
        },

        formatLabel: function(label){
            return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ');
        },

        formatNumber: function(number){
            return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').split('.')[0];
        },

        close: function(){
            this.step = null;
            Backbone.View.prototype.close.call(this);
        }
    });

    return fateView;
});