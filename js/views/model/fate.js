define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'nucos',
    'model/step',
    'text!templates/model/fate.html',
    'text!templates/model/ics209.html',
    'text!templates/default/export.html',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotcrosshair',
    'flotpie',
    'flotfillarea',
    'flotselect'
], function($, _, Backbone, moment, nucos, StepModel, FateTemplate, ICSTemplate, ExportTemplate){
    var fateView = Backbone.View.extend({
        step: new StepModel(),
        className: 'fate',
        frame: 0,
        colors: [
            'rgb(203,75,75)',
            'rgb(237,194,64)',
            'rgb(175,216,248)',
            'rgb(77,167,77)',
            'rgb(148,64,237)',
            'rgb(189,155,51)',
            'rgb(140,172,198)'
        ],

        events: {
            'shown.bs.tab': 'renderGraphs',
            'change #budget-table select': 'renderTableOilBudget',
            'click #budget-table .export a.download': 'downloadTableOilBudget',
            'click #budget-table .export a.print': 'printTableOilBudget',
            'change #ics209 input': 'ICSInputSelect',
            'change #ics209 select': 'renderTableICS',
            'click #ics209 .export a.download': 'downloadTableICS',
            'click #ics209 .export a.print': 'printTableICS'
        },

        initialize: function(){
            this.render();
            $(window).on('scroll', this.tableOilBudgetStickyHeader);
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
            var pp_min = Math.round(nucos.convert('Temperature', 'k', 'c', substance.get('pour_point_min_k')) * 100) / 100;
            var pp_max = Math.round(nucos.convert('Temperature', 'k', 'c', substance.get('pour_point_max_k')) * 100) / 100;
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
            var init_release = this.findInitialRelease(spills);
            var total_released = this.calcAmountReleased(spills, webgnome.model) + ' ' + spills.at(0).get('units');

            var compiled = _.template(FateTemplate, {
                name: substance.get('name'),
                api: substance.get('api'),
                wind_speed: wind_speed,
                pour_point: pour_point + ' &deg;C',
                wave_height: wave_height,
                water_temp: water.get('temperature') + ' &deg;' + water.get('units').temperature,
                release_time: moment(init_release, 'X').format(webgnome.config.date_format.moment),
                total_released: total_released,
                units: spills.at(0).get('units')
            });
            
            this.$el.html(compiled);

            this.$('#ics209 #start_time, #ics209 #end_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick_start').on('click', _.bind(function(){
                this.$('#start_time').datetimepicker('show');
            }, this));
            this.$('#datepick_end').on('click', _.bind(function(){
                this.$('#end_time').datetimepicker('show');
            }, this));
            var units = spills.at(0).get('units');
            this.$('#budget-table .released').val(units);
            this.$('#ics209 .vol-units').val(units);

            this.$('.export a').tooltip({
                placement: 'bottom',
                container: 'body'
            });

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
            } else if(active == '#ics209') {
                this.renderGraphICS(this.dataset);
            }
        },

        renderGraphOilBudget: function(dataset){
            dataset = this.pruneDataset(dataset, ['avg_density', 'amount_released', 'avg_viscosity', 'step_num', 'time_stamp']);
            if(_.isUndefined(this.graphOilBudget)){
                this.graphOilBudget = $.plot('#budget-graph .timeline .chart .canvas', dataset, {
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
                    colors: this.colors,
                    crosshair: {
                        mode: 'x',
                        color: '#999'
                    }
                });
                this.renderPiesTimeout = null;
                this.$('#budget-graph .timeline .chart .canvas').on('plothover', _.bind(this.timelineHover, this));
            } else {
                this.graphOilBudget.setData(dataset);
                this.graphOilBudget.setupGrid();
                this.graphOilBudget.draw();
            }
            this.timelineHover(null, {x: dataset[0].data[dataset[0].data.length - 1][0]}, null);
        },

        timelineHover: function(e, pos, item){
            if(!this.renderPiesTimeout){
                this.renderPiesTimeout = setTimeout(_.bind(function(){
                    this.renderPies(this.dataset, pos);
                }, this), 50);
            }
        },

        renderPies: function(dataset, pos){
            this.renderPiesTimeout = null;
            if(this.$('#budget-graph:visible .timeline .chart').length != 1){
                return;
            }
            
            var i, j;
            dataset = this.pruneDataset(dataset, ['avg_density', 'amount_released', 'avg_viscosity', 'step_num', 'time_stamp']);
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
                colors: this.colors,
                legend: {
                    show: false
                }
            };

            // possibly rewrite this part to update the data set and redraw the chart
            // might be more effecient than completely reinitalizing
            if(nominalData.length > 0){
                this.lowPlot = $.plot('.fate .minimum .canvas', lowData, chartOptions);
                this.nominalPlot = $.plot('.fate .mean .canvas', nominalData, chartOptions);
                this.highPlot = $.plot('.fate .maximum .canvas', highData, chartOptions);
            }
        },

        getPieData: function(pos, dataset, key){
            d = [];
            for (var i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                for (var j = 0; j < series[key].length; ++j) {
                    if (series[key][j][0] >= pos.x) {
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
            dataset = this.pruneDataset(dataset, ['avg_density', 'avg_viscosity', 'step_num', 'time_stamp']);
            var table = this.$('#budget-table table:first');
            var display = {
                time: this.$('#budget-table .time').val().trim(),
                released: this.$('#budget-table .released').val().trim(),
                other: this.$('#budget-table .other').val().trim()
            };
            var converter = new nucos.OilQuantityConverter();
            var spill = webgnome.model.get('spills').at(0);
            var substance = spill.get('element_type').get('substance');
            var from_unit = spill.get('units');
            var to_unit = display.released;
            var total_released = this.calcAmountReleased(webgnome.model.get('spills'), webgnome.model);
            this.$('#budget-table .info .amount-released').text(Math.round(converter.Convert(total_released, from_unit, substance.get('api'), 'API degree', to_unit)) + ' ' + to_unit);

            table.html('');
            table = '';
            m_date = moment(webgnome.model.get('start_time'));
            var opacity;
            for (var row = 0; row < dataset[0].data.length; row++){
                var ts_date = moment(dataset[0].data[row][0]);
                var duration = moment.duration(ts_date.unix() - m_date.unix(), 'seconds');
                if(ts_date.minutes() === 0 && duration.asHours() < 7 ||
                    duration.asHours() < 25 && duration.asHours() % 3 === 0 && ts_date.minutes() === 0 ||
                    duration.asHours() < 49 && duration.asHours() % 6 === 0 && ts_date.minutes() === 0 ||
                    duration.asHours() < 121 && duration.asHours() % 12 === 0 && ts_date.minutes() === 0 ||
                    duration.asHours() < 241 && duration.asHours() % 24 === 0 && ts_date.minutes() === 0){

                    if(opacity === 0.10){
                        opacity = 0.25;
                    } else {
                        opacity = 0.10;
                    }

                    var row_html = '';
                    if(row === 0){
                        row_html += '<thead><tr>';
                    } else {
                        row_html += '<tr>';
                    }
                    if(display.time === 'date'){
                        if(row === 0){
                            row_html += '<th>Date - Time</th>';
                        } else {
                            row_html += '<td>' + ts_date.format(webgnome.config.date_format.moment) + '</td>';
                        }
                    } else {
                        if(row === 0){
                            row_html += '<th>Time (hours)</th>';
                        } else {
                            row_html += '<td>' + duration.asHours() + '</td>';
                        }
                    }

                    for (var set in dataset){
                        to_unit = display.released;
                        var color = '';

                        if(dataset[set].name !== 'amount_released'){
                            color = this.colors[set];
                            color = color.replace('rgb', 'rgba').replace(')', ',' + opacity + ')');
                        }

                        if (row === 0) {
                            if (dataset[set].name === 'amount_released' || display.other === 'same') {
                                row_html +='<th style="background: ' + color + ';">' + dataset[set].label + ' (' + to_unit + ')</th>';
                            } else {
                                row_html += '<th style="background: ' + color + ';">' + dataset[set].label + ' (' + display.other + ')</th>';
                            }

                        } else {
                            var value = dataset[set].data[row][1];
                            if(dataset[set].label === 'Amount released'){
                                 value = Math.round(converter.Convert(value, from_unit, substance.get('api'), 'API degree', to_unit));
                                 to_unit = ' ' + to_unit;
                            } else {
                                if(display.other === 'same'){
                                    value = Math.round(converter.Convert(value, from_unit, substance.get('api'), 'API degree', to_unit));
                                } else if (display.other === 'percent'){
                                    value = Math.round(value / dataset[0].data[row][1] * 100);
                                } else {
                                    value = Math.round(value / dataset[0].data[row][1] * 100) / 100;
                                }
                            }
                            row_html += '<td style="background: ' + color + ';">' + value + '</td>';
                        }
                    }
                    if(row === 0){
                        row_html += '</tr></thead>';
                    } else {
                        row_html += '</tr>';                        
                    }
                    table += row_html;
                }
            }
            this.$('#budget-table table:first').html(table);
        },

        tableOilBudgetStickyHeader: function(e){
            if(this.$('#budget-table').length > 0){
                var top = $(window).scrollTop();
                var offset = this.$('#budget-table table:first').offset();

                if(top > offset.top && this.$('#budget-table .sticky').length === 0){
                    // a sticky header to the table.
                    $('<div class="container sticky"><div class="col-md-12"><table class="table">' + this.$('#budget-table table:last').html() + '</table></div></div>').insertAfter('#budget-table table');
                } else if(top <= offset.top && this.$('#budget-table .sticky').length > 0) {
                    // remove the sticky header from the table.
                    this.$('.sticky').remove();
                }
            }
        },

        downloadTableOilBudget: function(e){
            var table = this.$('#budget-table table');
            var type = $(e.target).data('type');
            if(type === undefined){
                type = $(e.target).parent().data('type');
            }
            var name = webgnome.model.get('name') ? webgnome.model.get('name') + ' Oil Budget Table Export' : 'Oil Budget Table Export';
            var filename = name + '.' + type;
            var content = '';

            switch(type){
                case 'csv':
                    content = this.tableToCSV(table, this.$('#budget-table .info div'));
                    break;
                case 'html':
                    content = this.tableToHTML(table, this.$('#budget-table .info').html());
                    break;
            }

            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            pom.setAttribute('download', filename);
            pom.click();
        },

        printTableOilBudget: function(e){
            window.print();
        },

        renderGraphEvaporation: function(dataset){
            dataset = this.pluckDataset(dataset, ['evaporated']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphEvaporation)){
                this.graphEvaporation = $.plot('#evaporation .timeline .chart .canvas', dataset, {
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
                    },
                    colors: [this.colors[1]]
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
                this.graphDispersion = $.plot('#dispersion .timeline .chart .canvas', dataset, {
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
                    },
                    colors: [this.colors[2]]
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
                this.graphDensity = $.plot('#density .timeline .chart .canvas', dataset, {
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
                    },
                    yaxis: {
                        ticks: 4,
                        tickDecimals: 3
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
                this.graphEmulsificaiton = $.plot('#emulsification .timeline .chart .canvas', dataset, {
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
            dataset = this.pluckDataset(dataset, ['avg_viscosity']);
            dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
            if(_.isUndefined(this.graphViscosity)){
                this.graphViscosity = $.plot('#viscosity .timeline .chart .canvas', dataset, {
                    grid: {
                        borderWidth: 1,
                        borderColor: '#ddd',
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser'
                    },
                    yaxis: {
                        ticks: [0, 10, 100, 1000, 10000, 100000],
                        transform: function(v){
                            return Math.log(v+10);
                        },
                        tickDecimals: 0
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

        renderGraphICS: function(dataset){
            if(!_.isArray(dataset)){
                dataset = this.dataset;
            }
            dataset = this.pruneDataset(dataset, ['avg_density', 'amount_released', 'avg_viscosity', 'step_num', 'time_stamp']);
            if(_.isUndefined(this.graphICS)){
                this.$('#ics209 .timeline .chart .canvas').on('plotselected', _.bind(this.ICSPlotSelect, this));
                
                // prevent the user from accidentally or purposfully unselecting
                // the time range.
                this.$('#ics209 .timeline .chart .canvas').on('plotunselected', _.bind(function(e, ranges){
                    this.graphICS.setSelection(this.ICSSelection);
                }, this));
                
                this.graphICS = $.plot('#ics209 .timeline .chart .canvas', dataset, {
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
                    colors: this.colors,
                    selection: {
                        mode: 'x',
                        color: '#428bca'
                    }
                });

            } else {
                this.graphICS.setData(dataset);
                this.graphICS.setupGrid();
                this.graphICS.draw();
                if(this.ICSSelection){
                    this.graphICS.setSelection(this.ICSSelection);
                }
            }
        },

        ICSPlotSelect: function(e, ranges){
            var start_input = this.$('#ics209 #start_time');
            var end_input = this.$('#ics209 #end_time');
            var date_format = webgnome.config.date_format.moment;
            var start_time = moment(parseInt(ranges.xaxis.from, 10) / 1000, 'X');
            var end_time = moment(parseInt(ranges.xaxis.to, 10) / 1000, 'X');
            var selection = {
                xaxis: {
                    from: start_time.unix() * 1000,
                    to: end_time.unix() * 1000
                },
                yaxis:{
                    from: ranges.yaxis.from,
                    to: ranges.yaxis.to
                }
            };

            this.updateICSSelection(selection);
        },

        ICSInputSelect: function(){
            var start_input = this.$('#ics209 #start_time');
            var end_input = this.$('#ics209 #end_time');
            var date_format = webgnome.config.date_format.moment;
            var start_time = moment(start_input.val(), date_format);
            var end_time = moment(end_input.val(), date_format);
            var selection = {
                xaxis: {
                    from: start_time.unix() * 1000,
                    to: end_time.unix() * 1000
                },
                yaxis:{
                    from: this.ICSSelection.yaxis.from,
                    to: this.ICSSelection.yaxis.to
                }
            };

            this.updateICSSelection(selection);
        },

        updateICSSelection: function(selection){
            var start_input = this.$('#ics209 #start_time');
            var end_input = this.$('#ics209 #end_time');
            var date_format = webgnome.config.date_format.moment;
            var changed = true;

            if(!_.isUndefined(this.ICSSelection)){
                if(selection.xaxis.to !== this.ICSSelection.xaxis.to ||
                selection.xaxis.from !== this.ICSSelection.xaxis.from){
                    start_input.val(moment(selection.xaxis.from / 1000, 'X').format(date_format));
                    end_input.val(moment(selection.xaxis.to / 1000, 'X').format(date_format));

                    changed = true;
                } else {
                    changed = false;
                }
            } else {
                start_input.val(moment(selection.xaxis.from / 1000, 'X').format(date_format));
                end_input.val(moment(selection.xaxis.to / 1000, 'X').format(date_format));

            }

            if(changed){
                this.renderTableICS(selection);
                this.graphICS.setSelection(selection, true);
            }
            this.ICSSelection = selection;
        },

        renderTableICS: function(selection){
            if(!_.has(selection, 'xaxis') && _.isUndefined(this.ICSSelection)){
                return false;
            } else if(!_.has(selection, 'xaxis')){
                selection = this.ICSSelection;
            }

            var start = selection.xaxis.from;
            var end = selection.xaxis.to;
            var units = this.$('#ics209 .vol-units').val();
            var api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
            var dataset = this.pluckDataset(this.dataset, ['amount_released', 'dispersed', 'evaporated', 'floating', 'burned', 'skimmed']);
            var report = {
                spilled: 0,
                evaporated: 0,
                dispersed: 0,
                burned: 0,
                skimmed: 0,
                floating: 0,
                amount_released: 0
            };
            var cumulative = _.clone(report);

            for(var set in dataset){
                for(var step in dataset[set].data){
                    if(dataset[set].data[step][0] >= start && dataset[set].data[step][0] <= end){
                        report[dataset[set].name] += parseInt(dataset[set].data[step][1], 10);
                    }
                }
            }
            for(var set in dataset){
                for(var step in dataset[set].data){
                    if(dataset[set].data[step][0] <= end){
                        cumulative[dataset[set].name] += parseInt(dataset[set].data[step][1], 10);
                    }
                }
            }

            var converter = new nucos.OilQuantityConverter();
            for(var value in report){
                report[value] = Math.round(converter.Convert(report[value], 'kg', api, 'API degree', units));
                
            }
            for(var value in cumulative){
                cumulative[value] = Math.round(converter.Convert(cumulative[value], 'kg', api, 'API degree', units));
            }
            
            var compiled = _.template(ICSTemplate, {
                report: report,
                cumulative: cumulative,
                units: units
            });

            this.$('#ics209 .ics-table').html(compiled);
        },

        downloadTableICS: function(e){
            var table = this.$('#ics209 table:last');
            var type = $(e.target).data('type');
            if (type === undefined){
                type = $(e.target).parent().data('type');
            }
            var name = webgnome.model.get('name') ? webgnome.model.get('name') + ' ICS 209' : 'ICS 209';
            var filename = name + '.' + type;
            var content = '';

            switch(type){
                case 'csv':
                    content = this.tableToCSV(table);
                    break;
                case 'html':
                    content = this.tableToHTML(table);
                    break;
            }

            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            pom.setAttribute('download', filename);
            pom.click();
        },

        printTableICS: function(){
            window.print();
        },

        tableToCSV: function(table, header){
            var csv = [];
            var rows = table.find('tr');
            rows.each(function(row){
                var csv_row = [];
                var cells = $(rows[row]).find('th, td');
                cells.each(function(cell){
                    csv_row.push($(cells[cell]).text());
                });
                csv.push(csv_row.join(','));
            });

            if(!_.isUndefined(header)){
                var cols = csv[0].split(',').length;
                header.each(function(row){
                    cells = $(header[row]).text().split(':');
                    csv_row = [cells[0] + ':', cells[1]];

                    for(i = 0; i < cols.length - cells.length; i++){
                        csv_row.push(' ');
                    }
                    csv.unshift(csv_row.join(','));
                });
            }
            return csv.join('\r\n');
        },

        tableToHTML: function(table, header){
            if(_.isUndefined(header)){
                header = '';
            }
            return _.template(ExportTemplate, {body: header.replace(/°/g, '') + '<table class="table table-striped">' + table.html() + '</table>'});
        },

        buildDataset: function(cb){
            if(this.frame <= webgnome.model.get('num_time_steps')){
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
                delete titles.step_num;
                delete titles.time_stamp;
                delete titles.floating;
                delete titles.dispersed;
                delete titles.evaporated;
                var keys = Object.keys(titles);
                keys.unshift('floating', 'evaporated', 'dispersed');

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
                if(['avg_density', 'dispersed', 'evaporated', 'emulsified', 'avg_viscosity'].indexOf(this.dataset[set].name) !== -1){
                    min = _.min(step.get('WeatheringOutput'), function(run){
                        return run[this.dataset[set].name];
                    }, this);
                    low_value = min[this.dataset[set].name];
                    low_value = converter.Convert(low_value, 'kg', api, 'API degree', units);

                    max = _.max(step.get('WeatheringOutput'), function(run){
                        return run[this.dataset[set].name];
                    }, this);
                    high_value = max[this.dataset[set].name];
                    high_value = converter.Convert(high_value, 'kg', api, 'API degree', units);
                } else {
                    low_value = low[this.dataset[set].name];
                    low_value = converter.Convert(low_value, 'kg', api, 'API degree', units);

                    high_value = high[this.dataset[set].name];
                    high_value = converter.Convert(high_value, 'kg', api, 'API degree', units);
                }

                nominal_value = nominal[this.dataset[set].name];
                nominal_value = converter.Convert(nominal_value, 'kg', api, 'API degree', units);

                this.dataset[set].high.push([date.unix() * 1000, high_value]);
                this.dataset[set].low.push([date.unix() * 1000, low_value]);
                this.dataset[set].data.push([date.unix() * 1000, nominal_value, 0, low_value, high_value]);
                webgnome.mass_balance = this.dataset;
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
         * @param  {Collection} spills  Collection of spill objects
         * @param  {Object} model       gnome model object
         * @return {Integer}            Amount of oil released in the models time period, same unit as spill.
         */
        calcAmountReleased: function(spills, model){
            var init_release = this.findInitialRelease(spills);
            var total_amount = 0;
            spills.forEach(_.bind(function(spill){
                var release_time = moment(spill.get('release').get('release_time')).unix();
                if(init_release > release_time){
                    init_release = release_time;
                }

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

                total_amount += release_run_time * release_per_second;
            }, this));
            return total_amount;
        },

        findInitialRelease: function(spills){
            var release_init = moment(spills.at(0).get('release').get('release_time')).unix();
            spills.forEach(function(spill){
                release_start = moment(spill.get('release').get('release_time')).unix();
                if(release_start < release_init){
                    release_init = release_start;
                }
            });

            return release_init;
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();
            this.step = null;
            $(window).off('scroll', this.tableOilBudgetStickyHeader);
            Backbone.View.prototype.close.call(this);
        }
    });

    return fateView;
});