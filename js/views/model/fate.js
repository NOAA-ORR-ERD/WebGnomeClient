define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'nucos',
    'model/step',
    'text!templates/model/fate.html',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotcrosshair',
    'flotpie',
    'flotfillarea'
], function($, _, Backbone, moment, nucos, StepModel, FateTemplate){
    var fateView = Backbone.View.extend({
        step: new StepModel(),
        className: 'fate',
        frame: 0,

        events: {
            'shown.bs.tab': 'renderGraphs',
            'change #budget-table select': 'renderTableOilBudget'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var substance = webgnome.model.get('spills').at(0).get('element_type').get('substance');
            var wind = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).get('wind');
            if(_.isUndefined(wind)){
                wind_speed = '';
            } else if (wind.get('timeseries').length === 1) {
                wind_speed = 'Constant ' + wind.get('timeseries')[0][1][0] + ' ' + wind.get('units');
            } else {
                wind_speed = 'Variable Speed';
            }

            var pour_point;
            var pp_min = substance.get('pour_point_min_k');
            var pp_max = substance.get('pour_point_max_k');
            if(pp_min === pp_max){
                pour_point = pp_min;
            } else if (pp_min && pp_max) {
                pour_point = pp_min + ' - ' + pp_max;
            } else {
                pour_point = pp_min + pp_max;
            }

            var water = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).get('water');
            var wave_height = 'Computed from wind';
            if(water.get('wave_height')){
                wave_height = water.get('wave_height') + ' ' + water.get('units').wave_height;
            } else if (water.get('fetch')) {
                wave_height = water.get('fetch') + ' ' + water.get('units').fetch;
            }

            var spills = webgnome.model.get('spills');
            var total_released = 0;
            var init_release = moment(spills.at(0).get('release').get('release_time')).unix();
            spills.forEach(_.bind(function(spill){
                var release_time = moment(spill.get('release').get('release_time')).unix();
                if(init_release > release_time){
                    init_release = release_time;
                }

                total_released += this.calcAmountReleased(spill, webgnome.model);
            }, this));
            total_released += ' ' + spills.at(0).get('units');

            var compiled = _.template(FateTemplate, {
                name: substance.get('name'),
                api: substance.get('api'),
                wind_speed: wind_speed,
                pour_point: pour_point,
                wave_height: wave_height,
                water_temp: water.get('temperature') + ' &deg;' + water.get('units').temperature,
                release_time: moment(init_release, 'X').format(webgnome.config.date_format.moment),
                total_released: total_released
            });
            this.$el.html(compiled);
            var units = spills.at(0).get('units');
            this.$('#budget-table .released').val(units);
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
            if(active == '#budget-graph') {
                this.renderGraphOilBudget(this.dataset);
            } else if(active == '#budget-table') {
                this.renderTableOilBudget(this.dataset);
            } else if(active == '#evaporation') {
                this.renderGraphEvaporation(this.dataset);
            } else if(active == '#dispersion') {
                this.renderGraphDispersion(this.dataset);
            } else if(active == '#density') {
                this.renderGraphDensity(this.dataset);
            } else if(active == '#emulsification') {
                this.renderGraphEmulsification(this.dataset);
            } else if(active == '#viscosity') {
                this.renderGraphViscosity(this.dataset);
            }
        },

        renderGraphOilBudget: function(dataset){
            dataset = this.pruneDataset(dataset, ['avg_density', 'amount_released']);
            if(_.isUndefined(this.graphOilBudget)){
                this.graphOilBudget = $.plot('#budget-graph .timeline .chart', dataset, {
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
            } else {
                this.graphOilBudget.setData(dataset);
                this.graphOilBudget.setupGrid();
                this.graphOilBudget.draw();
            }
            this.timelineHover(null, {x: dataset[0].data[dataset[0].data.length - 1][0]}, null);
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
            var dataset = this.pruneDataset(this.dataset, ['avg_density', 'amount_released']);
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

        renderTableOilBudget: function(dataset){
            if(!_.isArray(dataset)){
                dataset = _.clone(this.dataset);
            }
            dataset = this.pruneDataset(dataset, ['avg_density']);
            var table = this.$('#budget-table table');
            var display = {
                time: this.$('#budget-table .time').val(),
                released: this.$('#budget-table .released').val(),
                other: this.$('#budget-table .other').val()
            };
            var converter = new nucos.OilQuantityConverter();
            var substance = webgnome.model.get('spills').at(0).get('element_type').get('substance');

            table.html('');
            m_date = moment(webgnome.model.get('start_time'));
            for (var row = 0; row < dataset[0].data.length; row++){

                var ts_date = moment(dataset[0].data[row][0]);
                var duration = moment.duration(ts_date.unix() - m_date.unix(), 'seconds');
                if(ts_date.minutes() === 0 && duration.asHours() < 7 ||
                    duration.asHours() <= 24 && ts_date.hours() % 3 === 0 && ts_date.minutes() === 0 ||
                    duration.asHours() > 24 && ts_date.hours() % 6 === 0 && ts_date.minutes() === 0){
                    var row_html = $('<tr></tr>');

                    if(display.time === 'date'){
                        if(row === 0){
                            row_html.append('<th>Date - Time</th>');
                        } else {
                            row_html.append('<td>' + ts_date.format(webgnome.config.date_format.moment) + '</td>');
                        }
                    } else {
                        if(row === 0){
                            row_html.append('<th>Hours into Spill</th>');
                        } else {
                            row_html.append('<td>' + duration.asHours() + '</td>');
                        }
                    }
                     
                    for (var set in dataset){
                        if (row === 0) {
                            row_html.append('<th>' + dataset[set].label + '</th>');
                        } else {
                            var value = dataset[set].data[row][1];
                            var to_unit = display.released;
                            var from_unit = webgnome.model.get('spills').at(0).get('units');
                            var api = substance.get('api');
                            if(dataset[set].label === 'Amount released'){
                                 value = Math.round(converter.Convert(value, from_unit, api, 'API degree', to_unit));
                                 to_unit = ' ' + to_unit;
                            } else {
                                if(display.other === 'same'){
                                    value = Math.round(converter.Convert(value, from_unit, api, 'API degree', to_unit));
                                    to_unit = ' ' + to_unit;
                                } else if (display.other === 'percent'){
                                    to_unit = '%';
                                    value = Math.round(value / dataset[0].data[row][1] * 100);
                                } else {
                                    to_unit = '';
                                    value = value / dataset[0].data[row][1];
                                }
                            }
                            row_html.append('<td>' + value + to_unit + '</td>');
                        }
                    }
                    table.append(row_html);
                }
            }
        },

        renderGraphEvaporation: function(dataset){
            dataset = this.pluckDataset(dataset, ['evaporated']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphEvaporation)){
                this.graphEvaporation = $.plot('#evaporation .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    }
                });
            } else {
                this.graphEvaporation.setData(dataset);
                this.graphEvaporation.setupGrid();
                this.graphEvaporation.draw();
            }
            dataset[0].fillArea = null;
        },

        renderGraphDispersion: function(dataset){
            dataset = this.pluckDataset(dataset, ['dispersed']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphDispersion)){
                this.graphDispersion = $.plot('#dispersion .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    }
                });
            } else {
                this.graphDispersion.setData(dataset);
                this.graphDispersion.setupGrid();
                this.graphDispersion.draw();
            }
            dataset[0].fillArea = null;
        },

        renderGraphDensity: function(dataset){
            dataset = this.pluckDataset(dataset, ['avg_density']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphDensity)){
                this.graphDensity = $.plot('#density .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    }
                });
            } else {
                this.graphDensity.setData(dataset);
                this.graphDensity.setupGrid();
                this.graphDensity.draw();
            }
            dataset[0].fillArea = null;
        },

        renderGraphEmulsification: function(dataset){
            dataset = this.pluckDataset(dataset, ['water']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphEmulsificaiton)){
                this.graphEmulsificaiton = $.plot('#emulsification .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    }
                });
            } else {
                this.graphEmulsificaiton.setData(dataset);
                this.graphEmulsificaiton.setupGrid();
                this.graphEmulsificaiton.draw();
            }
            dataset[0].fillArea = null;
        },

        renderGraphViscosity: function(dataset){
            dataset = this.pluckDataset(dataset, ['viscosity']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            console.log(dataset);
            if(_.isUndefined(this.graphViscosity)){
                this.graphViscosity = $.plot('#viscosity .timeline .chart', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    series: {
                        lines: {
                            show: true,
                            lineWidth: 1
                        },
                        shadowSize: 0
                    }
                });
            } else {
                this.graphViscosity.setData(dataset);
                this.graphViscosity.setupGrid();
                this.graphViscosity.draw();
            }
            dataset[0].fillArea = null;
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
                var keys = Object.keys(titles);
                for(var type in keys){
                    this.dataset.push({
                        data: [],
                        high: [],
                        low: [],
                        label: this.formatLabel(keys[type]),
                        name: keys[type],
                        direction: {
                            show: false
                        },
                    });
                }
            }

            var date = moment(step.get('WeatheringOutput').time_stamp);
            var units = webgnome.model.get('spills').at(0).get('units');
            var api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
            var converter = new nucos.OilQuantityConverter();

            for(var set in this.dataset){
                low_value = low[this.dataset[set].name];
                low_value = converter.Convert(low_value, 'kg', api, 'API degree', units);
                this.dataset[set].low.push([date.unix() * 1000, low_value]);

                high_value = high[this.dataset[set].name];
                high_value = converter.Convert(high_value, 'kg', api, 'API degree', units);
                this.dataset[set].high.push([date.unix() * 1000, high_value]);

                nominal_value = nominal[this.dataset[set].name];
                nominal_value = converter.Convert(nominal_value, 'kg', api, 'API degree', units);
                this.dataset[set].data.push([date.unix() * 1000, nominal_value, 0, low_value, high_value]);
            }
        },

        pruneDataset: function(dataset, leaves){
            return _.filter(dataset, function(set){
                return leaves.indexOf(set.name) === -1;
            });
        },

        pluckDataset: function(dataset, leaves){
            return _.filter(dataset, function(set){
                return leaves.indexOf(set.name) !== -1;
            });
        },

        formatLabel: function(label){
            return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ');
        },

        formatNumber: function(number){
            return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').split('.')[0];
        },

        /**
         * Calculate the amount of oil released given the release start and end time in relation to the models end time.
         * @param  {Object} spill      Spill object
         * @param  {Object} model      gnome model object
         * @return {Integer}           Amount of oil released in the models time period, same unit as spill.
         */
        calcAmountReleased: function(spill, model){
            var amount = spill.get('amount');
            var release_start = moment(spill.get('release').get('release_time')).unix();
            var release_end = moment(spill.get('release').get('end_release_time')).unix();
            if(release_start === release_end){
                release_end += 2;
            }
            var model_end = moment(model.get('start_time')).add(model.get('duration'), 's').unix();

            // find the rate of the release per second.
            var release_duration = release_end - release_start;
            var release_per_second = amount / release_duration;

            // find the percentage of the release time that fits in the model 
            var release_run_time;
            if (model_end > release_end){
                release_run_time = release_duration;
            } else {
                var overlap = release_end - model_end;
                release_run_time = release_duration - overlap;
            }

            return release_run_time * release_per_second;
        },

        close: function(){
            this.step = null;
            Backbone.View.prototype.close.call(this);
        }
    });

    return fateView;
});