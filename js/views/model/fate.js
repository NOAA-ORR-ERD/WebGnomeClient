define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'nucos',
    'html2canvas',
    'sweetalert',
    'model/step',
    'model/spill/gnomeoil',
    'model/risk/risk',
    'model/movers/wind',
    'text!templates/model/fate.html',
    'text!templates/model/ics209.html',
    'text!templates/default/export.html',
    'text!templates/model/fate/buttons.html',
    'text!templates/model/fate/breakdown_item.html',
    'text!templates/model/fate/no_weathering.html',
    'views/base',
    'views/wizard/risk',
    'views/form/oil/library',
    'views/form/water',
    'views/form/wind',
    'views/form/spill/type',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotpie',
    'flotfillarea',
    'flotselect',
    'flotneedle',
    'moment-round',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, nucos, html2canvas, swal,
            GnomeStep, GnomeOil, RiskModel, WindmoverModel,
            FateTemplate, ICSTemplate, ExportTemplate,
            ButtonsTemplate, BreakdownTemplate, NoWeatheringTemplate,
            BaseView, RiskFormWizard, OilLibraryView, WaterForm, WindForm,
            SpillTypeForm, SpillInstantForm, SpillContinueForm) {
    'use strict';
    var fateView = BaseView.extend({
        className: 'fate-view',
        frame: 0,
        rendered: false,

        events: {
            'shown.bs.tab': 'renderGraphs',
            //'click a.run-risk': 'clickRisk',
            'change #budget-table select': 'renderTableOilBudget',
            'click #budget-table .export a.download': 'downloadTableOilBudget',
            'click a.print': 'printScreen',
            'change #ics209 input': 'ICSInputSelect',
            'change #ics209 select': 'renderTableICS',
            'click a[data-type=html]': 'exportHTML',
            'click .gnome-help': 'renderHelp',
            'click .saveas': 'saveGraphImage',
            'click .print-graph': 'printGraphImage',
            'click a[data-type=csv]': 'exportCSV',
            'change .vol-units': 'renderGraphICS',
            'click .spill .select': 'renderSpillForm',
            'click .substance .select': 'renderOilLibrary',
            'click .water .select': 'renderWaterForm',
            'click .wind .select': 'renderWindForm'
        },
        dataPrecision: 3,

        defaultChartOptions: {
            grid: {
                borderWidth: 1,
                borderColor: '#ddd',
                hoverable: true,
            },
            xaxes: [
                {
                    position: 'bottom',
                    mode: 'time',
                    timezone: 'browser',
                    timeformat: "%Y/%m/%d",
                    minTickSize: [1, "day"]
                },
                {
                    position: 'top',
                    mode: 'time',
                    timezone: 'browser',
                    timeformat: "%H:%M"
                }
            ],
            series: {
                lines: {
                    show: true,
                    lineWidth: 2
                },
                shadowSize: 0
            },
            yaxis: {},
            needle: {
                on: false,
                stack: false,
                noduplicates: true,
                label: this.formatNeedleLabel,
                x_tooltip: {
                    formatX: function(text) {
                        var unix_time = parseInt(text, 10);
                        return moment(unix_time).format(webgnome.config.date_format.moment);
                    }
                }
            },
            legend: {
                position: 'nw'
            }
        },

        tabToLabelMap: {
            'dispersion': 'natural_dispersion',
            'viscosity': 'avg_viscosity',
            'evaporation': 'evaporated',
            'sedimentation': 'sedimentation',
            'density': 'avg_density',
            'emulsification': 'water_content',
            'dissolution': 'dissolution'
        },
        
        nameToColorMap: {
            'evaporated': 'rgb(78, 121, 167)',
            'natural_dispersion': 'rgb(117, 183, 178)',            
            'sedimentation': 'rgb(237, 201, 72)',
            'beached': 'rgb(156, 117, 95)',
            'observed_beached': 'rgb(156, 117, 95)',
            'off_maps': 'rgb(50, 50, 50)',
            'skimmed': 'rgb(255, 157, 167)',
            'chem_dispersed': 'rgb(176, 122, 161)',           
            'burned': 'rgb(225, 87, 89)',
            'boomed': 'rgb(50, 50, 50)',
            'floating': 'rgb(186, 176, 172)',
        },

        initialize: function(options) {
            this.module = module;
            BaseView.prototype.initialize.call(this, options);

            if (!webgnome.hasModel()) {
                webgnome.router.navigate('', true);
            }
            else if (webgnome.model.validWeathering()) {
                this.$el.appendTo('body');
                this.renderWeathering(options);
            }
            else {
                this.$el.appendTo('body');
                this.listenTo(webgnome.model, 'change', this.noWeathering);
                this.listenTo(webgnome.model.get('spills'), 'change add remove', this.noWeathering);
                this.noWeathering();
            }
        },

        renderWeathering: function(options) {
            this.formatXaxisLabel();
            this.render();

            $(window).on('scroll', this.tableOilBudgetStickyHeader);

            this.listenTo(webgnome.cache, 'rewind', this.reset);
            this.listenTo(webgnome.cache, 'step:recieved', this.disableRAC);
            this.listenTo(webgnome.cache, 'complete', this.enableRAC);
        },

        generateColorArray: function(dataset) {
            var colors = [];

            _.each(dataset, _.bind(function(el, i, arr) {
                var color = this.nameToColorMap[el.name];

                if (color) {
                    colors.push(color);
                }
                else {
                    colors.push('rgb(0,0,0)');
                }
            }, this));

            return colors;
        },

        noWeathering: function(options) {
            if (webgnome.model.validWeathering()) {
                this.$el.html('');
                this.renderWeathering();
            }
            else {
                this.$el.html(_.template(NoWeatheringTemplate));

                if (webgnome.model.get('spills').length === 0) {
                    this.$('.spill').addClass('missing');
                }

                if (!webgnome.model.getSubstance().get('is_weatherable')) {
                    this.$('.substance').addClass('missing');
                }

                if (webgnome.model.get('environment').where({obj_type: 'gnome.environment.water.Water'}).length === 0) {
                    this.$('.water').addClass('missing');
                }

                if (webgnome.model.get('environment').where({obj_type: 'gnome.environment.wind.Wind'}).length === 0) {
                   this.$('.wind').addClass('missing');
                }
            }
        },

        renderSpillForm: function() {
            if (webgnome.model.get('spills').length === 0) {
                var spillTypeForm = new SpillTypeForm();
                spillTypeForm.render();

                spillTypeForm.on('hidden', spillTypeForm.close);
                spillTypeForm.on('select', _.bind(function(form) {
                    form.on('wizardclose', form.close);
                    form.on('save', _.bind(function(model) {
                        webgnome.model.get('spills').add(form.model);
                        webgnome.model.save(null, {validate: false});

                        if (form.$el.is(':hidden')) {
                            form.close();
                        }
                        else {
                            form.once('hidden', form.close, form);
                        }
                    }, this));
                }, this));
            }
            else {
                var spill = webgnome.model.get('spills').at(0);
                var spillView;

                if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')) {
                    spillView = new SpillContinueForm(null, spill);
                }
                else {
                    spillView = new SpillInstantForm(null, spill);
                }

                spillView.on('save', function() {
                    spillView.on('hidden', spillView.close);
                });

                spillView.on('wizardclose', spillView.close);

                spillView.render();
            }
        },

        renderWaterForm: function() {
            var waterModel = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.water.Water'});
            var waterForm = new WaterForm(null, waterModel);

            waterForm.on('hidden', waterForm.close);
            waterForm.on('save', _.bind(function() {
                webgnome.model.get('environment').add(waterForm.model, {merge:true});
                webgnome.model.save(null, {silent: true});
            }, this));

            waterForm.render();
        },

        renderOilLibrary: function() {
            //this will be bugged
            var substance = new GnomeOil();
            var oilLib = new OilLibraryView({}, substance);

            oilLib.on('save wizardclose', _.bind(function() {
                if (oilLib.$el.is(':hidden')) {
                    oilLib.close();
                    webgnome.model.setGlobalSubstance(substance);
                }
                else {
                    oilLib.once('hidden', oilLib.close, oilLib);
                }
            }, this));

            oilLib.render();
        },

        renderWindForm: function() {
            var windForm;
            var windModel = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.wind.Wind'});

            if (!_.isNull(windModel)) {
                windForm = new WindForm(null, windModel);
            }
            else {
                windForm = new WindForm();
            }

            windForm.on('save', _.bind(function() {
                webgnome.model.get('environment').add(windForm.model, {merge: true});
                webgnome.model.get('movers').add(new WindmoverModel({wind: windForm.model}));
                webgnome.model.save(null, {silent: true});
            }, this));

            windForm.on('hidden', windForm.close);
            windForm.render();
        },

        enableRAC: function() {
            if (this.$('.run-risk').hasClass('disabled')) {
                this.$('.run-risk').removeClass('disabled');
            }
        },

        disableRAC: function() {
            if (!this.$('.run-risk').hasClass('disabled')) {
                this.$('.run-risk').addClass('disabled');
            }
        },

        formatXaxisLabel: function() {
            if (this.getUserTimePrefs() === 'datetime') { return; }

            var xaxisOpts = this.defaultChartOptions.xaxis;
            xaxisOpts.tickFormatter = this.xaxisTickFormatter;
        },

        xaxisTickFormatter: function(val, axis) {
            var start = axis.min;
            var current = val;
            var timeDiff = (moment(current).diff(moment(start), 'm') / 60.0).toFixed(2);
            var currentTimeDiffisWhole = (parseFloat(timeDiff) === parseInt(timeDiff, 10));
            var diffInFractHours = (!currentTimeDiffisWhole) ? timeDiff : moment(current).diff(moment(start), 'h');

            return diffInFractHours + ' hours';
        },

        getUserTimePrefs: function() {
            return webgnome.user_prefs.get('time');
        },

        getXaxisLabel: function() {
            return 'Time (' + this.getUserTimePrefs() + ')';
        },

        load: function() {
            if (webgnome.cache.length > 0) {
                // incase trajectory triggered a /step but it hasn't returned yet
                // and the user just toggled the switch to fate view
                // add a listener to handle that pending step.
                while (this.frame < webgnome.cache.length) {
                    webgnome.cache.at(this.frame, _.bind(this.loadStep, this));
                }

                this.listenTo(webgnome.cache, 'step:received', this.buildDataset);

                if(webgnome.cache.streaming && webgnome.cache.isHalted) {
                    webgnome.cache.resume();
                }
            }
            else {
                this.listenTo(webgnome.cache, 'step:received', this.buildDataset);

                if (!webgnome.cache.streaming && !webgnome.cache.preparing) {
                    webgnome.cache.getSteps();
                }
            }
            if (localStorage.getItem('autorun') === 'true') {
                localStorage.setItem('autorun', '');
            }
        },

        loadStep: function(err, step) {
           this.formatStep(step);

            // on the last step render the graph and if there are more steps start the steping.
            if (step.get('step_num') === webgnome.cache.length - 1) {
                this.renderGraphs();
            }

            this.frame++;
        },

        reset: function() {
            //this.listenTo(webgnome.cache, 'step:received', this.buildDataset);
            this.dataset = undefined;
            this.frame = 0;

            setTimeout(_.bind(this.load, this), 1000);
        },

        render: function() {
            BaseView.prototype.render.call(this);

            var compiled;
            var spills = webgnome.model.get('spills');
            var substance = webgnome.model.get('spills').at(0).get('substance');
            var wind = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).get('wind');
            var wind_speed;
            var time = this.getXaxisLabel();

            if (_.isUndefined(wind) || wind.get('timeseries') === null) {
                wind_speed = '';
            }
            else if (wind.get('timeseries') && wind.get('timeseries').length === 1) {
                wind_speed = 'Constant ' + wind.get('timeseries')[0][1][0] + ' ' + wind.get('units');
            }
            else {
                wind_speed = 'Variable Speed';
            }

            var water = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).get('water');
            var wave_height = 'Computed from wind';
            var total_released = this.calcAmountReleased(spills, webgnome.model) + ' ' + spills.at(0).get('units');

            if (water.get('wave_height')) {
                wave_height = water.get('wave_height') + ' ' + water.get('units').wave_height;
            }
            else if (water.get('fetch')) {
                wave_height = water.get('fetch') + ' ' + water.get('units').fetch;
            }

            var cleanup = this.checkForCleanup();
            var init_release = this.findInitialRelease(spills);
            var buttonsTemplate = _.template(ButtonsTemplate, {});
            var templateObj;

            if (substance.get('is_weatherable')) {
                var pour_point;
                var pp_min = Math.round(nucos.convert('Temperature', 'k', 'c', substance.get('pour_point_min_k')) * 100) / 100;
                var pp_max = Math.round(nucos.convert('Temperature', 'k', 'c', substance.get('pour_point_max_k')) * 100) / 100;

                if (pp_min === pp_max) {
                    pour_point = pp_min;
                }
                else if (pp_min && pp_max) {
                    pour_point = pp_min + ' - ' + pp_max;
                }
                else {
                    pour_point = pp_min + pp_max;
                }

                templateObj = {
                    name: substance.get('name'),
                    api: substance.get('api'),
                    wind_speed: wind_speed,
                    pour_point: pour_point + ' &deg;C',
                    wave_height: wave_height,
                    water_temp: water.get('temperature') + ' &deg;' + water.get('units').temperature,
                    release_time: moment(init_release, 'X').format(webgnome.config.date_format.moment),
                    total_released: total_released,
                    units: spills.at(0).get('units'),
                    buttons: buttonsTemplate,
                    time: time
                };

            }
            else {
                templateObj = {
                    name: 'Non-weathering substance',
                    api: 'N/A',
                    wind_speed: wind_speed,
                    pour_point: 'N/A',
                    wave_height: wave_height,
                    water_temp: water.get('temperature') + ' &deg;' + water.get('units').temperature,
                    release_time: moment(init_release, 'X').format(webgnome.config.date_format.moment),
                    total_released: total_released,
                    units: spills.at(0).get('units'),
                    buttons: buttonsTemplate,
                    time: time
                };
            }

            templateObj.rate_exposed = false;

            if (spills.length === 1 && spills.at(0).spillType() === 'continuous') {
                var spill = spills.at(0);
                var durationObj = spill.parseDuration();
                var hours = durationObj.days * 24 + durationObj.hours;

                templateObj.duration = hours + ' hours';
                templateObj.spill_rate = (spill.get('amount') / hours).toFixed(2) + ' ' + spill.get('units') + '/hour';
                templateObj.rate_exposed = true;
            }

            compiled = _.template(FateTemplate, templateObj);

            this.$el.html(compiled);
            this.rendered = true;

            this.$('#ics209 #start_time, #ics209 #end_time').datetimepicker({
                minDate: moment(webgnome.model.get('start_time')).format('YYYY/MM/DD'),
                startDate: moment(webgnome.model.get('start_time')).format('YYYY/MM/DD'),
                maxDate: moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's').format('YYYY/MM/DD'),
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
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

            if (cleanup === 0) {
                this.$('.run-risk').hide();
            }

            setTimeout(_.bind(this.load,this), 1000);
        },

        checkForCleanup: function() {
            var weatherers = webgnome.model.get('weatherers');
            var total = 0;

            for (var i = 0; i < weatherers.length; i++) {
                if (weatherers.at(i).get('obj_type').indexOf('cleanup') > -1) {
                    total++;
                }
            }

            return total;
        },

        showHelp: function() {
            this.$('.gnome-help').show();
            this.$('.gnome-help').tooltip();
        },

        renderGraphs: _.throttle(function() {
            // find active tab and render it's graph.
            var parentTabId = this.$('.active a').attr('href');
            var active = this.$(parentTabId + ' .active a').attr('href');

            if (_.isUndefined(active)) {
                active = parentTabId;
            }

            $('#flotTip').remove();

            if (active === '#budget-graph') {
                this.renderGraphOilBudget(this.dataset);
            }
            else if (active === '#budget-table') {
                this.renderTableOilBudget(this.dataset);
            }
            else if (active === '#evaporation') {
                this.renderGraphEvaporation(this.dataset);
            }
            else if (active === '#floating') {
                this.renderGraphFloating(this.dataset);
            }
            else if (active === '#dispersion') {
                this.renderGraphDispersion(this.dataset);
            }
            else if (active === '#dissolution') {
                this.renderGraphDissolution(this.dataset);
            }
            else if (active === '#sedimentation') {
                this.renderGraphSedimentation(this.dataset);
            }
            else if (active === '#density') {
                this.renderGraphDensity(this.dataset);
            }
            else if (active === '#emulsification') {
                this.renderGraphEmulsification(this.dataset);
            }
            else if (active === '#viscosity') {
                this.renderGraphViscosity(this.dataset);
            }
            else if (active === '#ics209') {
                this.renderGraphICS(this.dataset);
            }
        },200),

        renderGraphOilBudget: function(dataset) {
            var cloneset = this.pruneDataset(JSON.parse(JSON.stringify(dataset)), [
                'avg_density',
                'amount_released',
                'avg_viscosity',
                'step_num',
                'time_stamp',
                'water_content',
                'non_weathering',
                'water_density',
                'water_viscosity',
                'dispersibility_difficult',
                'dispersibility_unlikely',
                'secondtime',
                'systems'
                ]);

            var selection = this.$('.panel-primary').data('dataset');

            for (var i = 0; i < cloneset.length; i++) {
                cloneset[i].data = cloneset[i][selection];

                if (cloneset[i].yaxis) {
                    delete cloneset[i].yaxis;
                }
            }

            if (_.isUndefined(this.graphOilBudget)) {
                var options = $.extend(true, {}, this.defaultChartOptions);

                delete options.yaxes;
                options.yaxis = {};
                options.grid.autoHighlight = false;
                options.series.stack = true;
                options.series.group = true;
                options.series.lines.fill = 1;
                options.needle.tooltips = false;
                options.colors = this.generateColorArray(cloneset);
                options.legend.show = false;

                this.graphOilBudget = $.plot('#budget-graph .timeline .chart .canvas', cloneset, options);
                this.renderPiesTimeout = null;
                this.$('#budget-graph .timeline .chart .canvas').on('plothover', _.bind(this.timelineHover, this));
            }
            else {
                this.graphOilBudget.setData(cloneset);
                this.graphOilBudget.setupGrid();
                this.graphOilBudget.draw();
            }

            this.timelineHover(null, {x: cloneset[0].data[cloneset[0].data.length - 1][0]}, null);
        },

        timelineHover: function(e, pos, item) {
            if (!this.renderPiesTimeout) {
                this.renderPiesTimeout = setTimeout(_.bind(function() {
                    this.renderPies(this.dataset, pos);
                    this.renderBreakdown(this.dataset, pos);
                }, this), 50);
            }
        },

        renderBreakdown: function(datasetparam, pos) {
            var dataset = this.pruneDataset(datasetparam, [
                'avg_density',
                'avg_viscosity',
                'step_num',
                'time_stamp',
                'water_content',
                'non_weathering',
                'water_density',
                'water_viscosity',
                'dispersibility_difficult',
                'dispersibility_unlikely',
                'secondtime',
                'systems'
            ]);

            var data = this.getPieData(pos, dataset, this.$('#budget-graph .panel-primary').data('dataset'));

            if (data.length > 0) {
                var con_width = this.$('.breakdown').width() - (15 * (data.length - 2));
                var width = Math.floor(con_width / (data.length - 1));
                var compiled = '';
                var units = webgnome.model.get('spills').at(0).get('units');

                for (var i = 0; i < data.length; i++) {
                    if (data[i].label !== 'Amount released') {
                        var color = this.nameToColorMap[data[i].name];

                        compiled += _.template(BreakdownTemplate, {
                            color: color,
                            width: width,
                            label: data[i].label,
                            value: Math.round(data[i].data) + ' ' + units
                        });
                    }
                }
                this.$('.breakdown').html(compiled);
            }
        },

        renderPies: function(dataset, pos) {
            this.renderPiesTimeout = null;

            if (this.$('#budget-graph:visible .timeline .chart').length !== 1) {
                return;
            }

            var i, j;

            dataset = this.pruneDataset(dataset, [
                'avg_density',
                'amount_released',
                'avg_viscosity',
                'step_num',
                'time_stamp',
                'water_content',
                'non_weathering',
                'water_density',
                'water_viscosity',
                'dispersibility_difficult',
                'dispersibility_unlikely',
                'systems',
                'secondstime'
                ]);
            var lowData = this.getPieData(pos, dataset, 'low');
            var nominalData = this.getPieData(pos, dataset, 'nominal');
            var highData = this.getPieData(pos, dataset, 'high');

            var chartOptions = {
                series: {
                    pie: {
                        show: true,
                        stroke: {
                            width: 0
                        },
                        label: {
                            show: false
                        },
                        innerRadius: 0.65
                    }
                },
                colors: this.generateColorArray(dataset),
                legend: {
                    show: false
                }
            };

            // possibly rewrite this part to update the data set and redraw the chart
            // might be more effecient than completely reinitalizing
            if (nominalData.length > 0) {
                this.nominalPlot = $.plot('.mean .canvas', nominalData, chartOptions);
                this.$('.mean .oil-total').html('<span>' + Math.round(this.pieFloating(nominalData)) + ' ' + webgnome.model.get('spills').at(0).get('units') + '</span><br />Floating Oil');

                if (this.uncertainityExists) {
                    this.highPlot = $.plot('.maximum .canvas', highData, chartOptions);
                    this.$('.maximum .oil-total').html('<span>' + Math.round(this.pieFloating(highData)) + ' ' + webgnome.model.get('spills').at(0).get('units') + '</span><br />Floating Oil');

                    this.lowPlot = $.plot('.minimum .canvas', lowData, chartOptions);
                    this.$('.minimum .oil-total').html('<span>' + Math.round(this.pieFloating(lowData)) + ' ' + webgnome.model.get('spills').at(0).get('units') + '</span><br />Floating Oil');

                }
                else if (this.$('.chart-holder-uncert.invisible').length === 0) {
                    this.$('.chart-holder-uncert').addClass('invisible');
                }
            }
        },

        pieFloating: function(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].label === 'Floating') {
                    return data[i].data;
                }
            }
        },

        getPieData: function(pos, dataset, key) {
            var d = [];
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

                if (!_.isUndefined(p1) && !_.isUndefined(p2)) {
                    if (p1 === null) {
                        y = p2[1];
                    }
                    else if (p2 === null) {
                        y = p1[1];
                    }
                    else {
                        y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                    }

                    d.push({label: this.formatLabel(series.name), data: y, name: series.name});
                }
            }

            return d;
        },

        renderTableOilBudget: function(dataset) {
            if (!_.isArray(dataset)) {
                dataset = _.clone(this.dataset);
            }

            var budgetRealValueFormat = function(value) {
                if (value < 10) {
                    value = Number(value).toFixed(2);
                } else if (value < 100) {
                    value = Number(value).toFixed(1);
                } else {
                    value = Math.round(value);
                }
                return value;
            };

            dataset = this.pruneDataset(dataset, [
                'avg_density',
                'avg_viscosity',
                'step_num',
                'time_stamp',
                'water_content',
                'non_weathering',
                'water_density',
                'water_viscosity',
                'dispersibility_difficult',
                'dispersibility_unlikely',
                'secondtime',
                'systems'
                ]);
            var table = this.$('#budget-table table:first');
            var display = {
                time: this.$('#budget-table .time').val().trim(),
                released: this.$('#budget-table .released').val().trim(),
                other: this.$('#budget-table .other').val().trim()
            };

            var converter = new nucos.OilQuantityConverter();
            var spill = webgnome.model.get('spills').at(0);
            var substance = spill.get('substance');
            var substance_density;

            substance_density = substance.get('standard_density');

            var from_unit = spill.get('units');
            var to_unit = display.released;
            var total_released = this.calcAmountReleased(webgnome.model.get('spills'), webgnome.model);
            var converted_amount = Math.round(converter.Convert(total_released, from_unit, substance_density, 'kg/m^3', to_unit));

            this.$('#budget-table .info .amount-released').text(converted_amount + ' ' + to_unit);

            var spillDurationObj = spill.parseDuration();
            var spillDurationHrs = spillDurationObj.days * 24 + spillDurationObj.hours;
            this.$('#budget-table .info .rate-released').text((converted_amount / spillDurationHrs).toFixed(2) + ' ' + to_unit + '/hour');

            table.html('');
            table = '';
            var m_date = moment(webgnome.model.get('start_time'));
            var opacity;

            for (var row = 0; row < dataset[0].data.length; row++) {
                var ts_date = moment(dataset[0].data[row][0]);
                var duration = moment.duration(ts_date.unix() - m_date.unix(), 'seconds');
                var durationAsHrs = parseInt(duration.asHours(), 10);

                if (/*ts_date.minutes() === 0 &&*/ (duration.asHours() < 7 ||
                    duration.asHours() < 25 && duration.asHours() % 3 === 0 ||
                    duration.asHours() < 49 && duration.asHours() % 6 === 0 ||
                    duration.asHours() < 121 && duration.asHours() % 12 === 0 ||
                    duration.asHours() > 121 && duration.asHours() % 24 === 0) &&
                    (durationAsHrs === duration.asHours())) {

                    if (opacity === 0.10) {
                        opacity = 0.25;
                    }
                    else {
                        opacity = 0.10;
                    }

                    var row_html = '';

                    if (parseInt(row, 10) === 0) {
                        row_html += '<thead><tr>';
                    }
                    else {
                        row_html += '<tr class="' + row + '">';
                    }

                    if (display.time === 'date') {
                        if (row === 0) {
                            row_html += '<th>Date <br>&nbsp</th>';
                        }
                        else {
                            row_html += '<td>' + ts_date.format(webgnome.config.date_format.moment) + '</td>';
                        }
                    }
                    else {
                        if (row === 0) {
                            row_html += '<th>Time <br>(hours)</th>';
                        }
                        else {
                            row_html += '<td>' + duration.asHours() + '</td>';
                        }
                    }

                    for (var set in dataset) {
                        to_unit = display.released;
                        var color = '';

                        if (dataset[set].label !== 'Amount released' && dataset[set].name !== 'secondtime') {
                            color = this.nameToColorMap[dataset[set].name];
                            color = color.replace('rgb', 'rgba').replace(')', ',' + opacity + ')');
                        }

                        if (row === 0) {
                            if (dataset[set].name === 'amount_released' || display.other === 'same') {
                                row_html +='<th style="background: ' + color + ';">' + dataset[set].label + '<br> (' + to_unit + ')</th>';
                            }
                            else if (display.other === 'percent') {
                                row_html += '<th style="background: ' + color + ';">' + dataset[set].label + '<br> (%)</th>';
                            }
                            else {
                                row_html += '<th style="background: ' + color + ';">' + dataset[set].label + '<br> (' + display.other + ')</th>';
                            }

                        }
                        else {
                            var value = dataset[set].data[row][1];

                            if (dataset[set].label === 'Amount released') {
                                 value = Math.round(converter.Convert(value, from_unit, substance_density, 'kg/m^3', to_unit));
                                 to_unit = ' ' + to_unit;
                                 value = budgetRealValueFormat(value);
                            }
                            else {
                                if (display.other === 'same') {
                                    value = converter.Convert(value, from_unit, substance_density, 'kg/m^3', to_unit);
                                    value = budgetRealValueFormat(value);
                                }
                                else if (display.other === 'percent') {
                                    if (dataset[0].data[row][1]===0) {
                                    	value = 0;
                                    }
                                    else {
                                    	value = Math.round(value / dataset[0].data[row][1] * 100);
                                	}
                                }
                                else {
                                    if (dataset[0].data[row][1]===0){
                                    	value = 0;
                                    }
                                    else {
                                    	value = Math.round(value / dataset[0].data[row][1] * 100) / 100;
                                    }
                                }
                            }

                            row_html += '<td style="background: ' + color + ';">' + value + '</td>';
                        }
                    }

                    if (row === 0) {
                        row_html += '</tr></thead>';
                    }
                    else {
                        row_html += '</tr>';
                    }

                    table += row_html;
                }
            }

            this.$('#budget-table table:first').html(table);

            if ($('.container.sticky').length > 0) {
                $('.container.sticky table:first').html(table);
            }
        },

        tableOilBudgetStickyHeader: function(e) {
            if (this.$('#budget-table:visible').length > 0) {
                var top = $(window).scrollTop() + 50;
                var offset = this.$('#budget-table table:first').offset();

                if (top > offset.top && this.$('#budget-table .sticky').length === 0) {
                    // a sticky header to the table.
                    $('<div class="container sticky"><div class="col-md-12"><table class="table" style="table-layout: fixed; min-height: 100px;">' + this.$('#budget-table table:last').html() + '</table></div></div>').insertAfter('#budget-table table');
                }
                else if (top <= offset.top && this.$('#budget-table .sticky').length > 0) {
                    // remove the sticky header from the table.
                    this.$('.sticky').remove();
                }
            }
        },

        downloadTableOilBudget: function(e) {
            var table = this.$('#budget-table table');
            var type = $(e.target).data('type');

            if (type === undefined) {
                type = $(e.target).parent().data('type');
            }

            var name = webgnome.model.get('name') ? webgnome.model.get('name') + ' Oil Budget Table Export' : 'Oil Budget Table Export';
            var filename = name + '.' + type;
            var content = '';

            switch(type) {
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

        printScreen: function(e) {
            window.print();
        },

        renderGraphEvaporation: function(dataset) {
            dataset = this.pluckDataset(dataset, ['evaporated', 'secondtime']);

            if (dataset.length === 2) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];

                if (_.isUndefined(this.graphEvaporation)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.colors = this.generateColorArray(dataset);
                    this.graphEvaporation = $.plot('#evaporation .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphEvaporation.setData(dataset);
                    this.graphEvaporation.setupGrid();
                    this.graphEvaporation.draw();
                }
                dataset[0].fillArea = null;
            }
            else {
                this.$('#evaporation .timeline .chart').text('Weatherer Turned Off');
            }
        },

        renderGraphFloating: function(dataset) {
            dataset = this.pluckDataset(dataset, ['floating', 'secondtime']);

            if (dataset.length === 2) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
                if (_.isUndefined(this.graphFloating)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.colors = this.generateColorArray(dataset);

                    this.graphFloating = $.plot('#floating .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphFloating.setData(dataset);
                    this.graphFloating.setupGrid();
                    this.graphFloating.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#floating .timeline .chart').text('Weatherer Turned Off');
            }
        },

        renderGraphDispersion: function(dataset) {
            dataset = this.pluckDataset(dataset, ['natural_dispersion', 'secondtime']);

            if (dataset.length === 2) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
                if (_.isUndefined(this.graphDispersion)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.colors = this.generateColorArray(dataset);

                    this.graphDispersion = $.plot('#dispersion .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphDispersion.setData(dataset);
                    this.graphDispersion.setupGrid();
                    this.graphDispersion.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#dispersion .timeline .chart').text('Weatherer Turned Off');
            }
        },

        renderGraphSedimentation: function(dataset) {
            dataset = this.pluckDataset(dataset, ['sedimentation', 'secondtime']);

            if (dataset.length === 2) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];

                if (_.isUndefined(this.graphSedimentation)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.colors = this.generateColorArray(dataset);

                    this.graphSedimentation = $.plot('#sedimentation .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphSedimentation.setData(dataset);
                    this.graphSedimentation.setupGrid();
                    this.graphSedimentation.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#sedimentation .timeline .chart').text('Weatherer Turned Off');
            }
        },

        renderGraphDensity: function(dataset) {
            dataset = this.pluckDataset(dataset, ['avg_density', 'water_density', 'secondtime']);

            if (dataset.length === 3) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];
                dataset[0].label = 'Average Oil (Emulsion) Density';

                if (_.isUndefined(this.graphDensity)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.yaxis.ticks = 4;
                    options.yaxis.tickDecimals = 2;
                    options.colors = ["rgb(0,0,0)", "rgb(78,121,167)", "rgb(0,0,0)"];
                    this.graphDensity = $.plot('#density .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphDensity.setData(dataset);
                    this.graphDensity.setupGrid();
                    this.graphDensity.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#density .timeline .chart').text('Dataset incomplete for graph display');
            }
        },

        renderGraphEmulsification: function(dataset) {
            // we will be modifying stuff in our dataset, so make a deep copy
            dataset = JSON.parse(
                JSON.stringify(
                    this.pluckDataset(dataset,
                                      ['water_content',
                                       'secondtime',
                                       'floating']
            )));

            var units = webgnome.model.get('spills').at(0).get('units');
            var options = $.extend(true, {}, this.defaultChartOptions);

            var flt_id, wc_id;

            if (dataset.length === 3) {
                for (var i = 0; i < dataset.length; i++) {

                    if (dataset[i].name === 'floating') {
                        flt_id = i;
                        if (['kg', 'ton', 'metric ton'].indexOf(units) > -1) {
                            dataset[i] = this.convertDataset(dataset[i], 'bbl', true);
                            this.$('.secondYaxisLabel').text('bbl');
                        }
                        dataset[i].yaxis = 2;
                        dataset[i].label = 'Surface Volume including Emulsion';
                    }

                    if (dataset[i].name === 'water_content') {
                        wc_id = i;
                        dataset[i].label = 'Water Content of Emulsion';
                    }

                    dataset[i].needle = {
                        label: _.bind(this.formatNeedleLabel, this),
                        formatX: _.bind(this.formatNeedleTime, this)
                    };

                    if (dataset[i].name !== 'secondtime') {
                        dataset[i].fillArea = [{representation: 'symmetric'},
                                               {representation: 'asymmetric'}];
                    }
                }

                var total_wc = 0;
                for (i = 0; i < dataset[flt_id].data.length; i++) {
                    let flt_data_i = dataset[flt_id].data[i];
                    let wc_data_i = dataset[wc_id].data[i];

                    total_wc = total_wc + wc_data_i[1];
                    flt_data_i[1] = flt_data_i[1] + flt_data_i[1] * wc_data_i[1] / 100;
                    flt_data_i[3] = flt_data_i[3] + flt_data_i[3] * wc_data_i[3] / 100;
                    flt_data_i[4] = flt_data_i[4] + flt_data_i[4] * wc_data_i[4] / 100;
                }

                if (total_wc === 0) {
                    this.$('#emulsification .timeline .chart').text('Emulsification not predicted.');
                }
                else {
                    if (_.isUndefined(this.graphEmulsification)) {
                        delete options.yaxis;
                        options.yaxes = [{}, { position: 'right'}];
                        options.colors = ["rgb(0,0,0)", "rgb(78,121,167)", "rgb(0,0,0)"];
                        this.graphEmulsification = $.plot('#emulsification .timeline .chart .canvas', dataset, options);
                    }
                    else {
                        this.graphEmulsification.setData(dataset);
                        this.graphEmulsification.setupGrid();
                        this.graphEmulsification.draw();
                    }

                    dataset[0].fillArea = null;
                }
            }
            else {
                this.$('#emulsification .timeline .chart').text('Dataset incomplete for graph display');
            }
        },

        renderGraphViscosity: function(dataset){
            dataset = this.pluckDataset(dataset, ['avg_viscosity', 'water_viscosity', 'dispersibility_difficult', 'dispersibility_unlikely', 'secondtime']);

            if (dataset.length === 5) {
                dataset[0].label = 'Average oil viscosity';
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];

                if (_.isUndefined(this.graphViscosity)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.yaxis = {
                        ticks: [1, 10, 100, 1000, 10000, 100000, 10000000],
                        tickFormatter: function(tick) {
                            return tick.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        },
                        transform: function(v) {
                            return Math.log(v+10);
                        },
                        inverseTransform: function(v) {
                            return Math.exp(v);
                        },
                        tickDecimals: 0
                    };
                    options.colors = ["rgb(0,0,0)", "rgb(78,121,167)", "rgb(242,142,43)", "rgb(225,87,89)", "rgb(0,0,0)"];
                    this.graphViscosity = $.plot('#viscosity .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphViscosity.setData(dataset);
                    this.graphViscosity.setupGrid();
                    this.graphViscosity.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#viscosity .timeline .chart').text('Dataset incomplete for graph display');
            }
        },

        renderGraphDissolution: function(dataset) {
            dataset = this.pluckDataset(dataset, ['dissolution', 'secondtime']);

            if (dataset.length === 2) {
                dataset[0].fillArea = [{representation: 'symmetric'}, {representation: 'asymmetric'}];

                if (_.isUndefined(this.graphDissolution)) {
                    var options = $.extend(true, {}, this.defaultChartOptions);
                    options.colors = this.generateColorArray(dataset);

                    this.graphDissolution = $.plot('#dissolution .timeline .chart .canvas', dataset, options);
                }
                else {
                    this.graphDissolution.setData(dataset);
                    this.graphDissolution.setupGrid();
                    this.graphDissolution.draw();
                }

                dataset[0].fillArea = null;
            }
            else {
                this.$('#dissolution .timeline .chart').text('Weatherer Turned Off');
            }
        },

        convertDataset: function(d, to_unit, single) {
            var data, arr, k, i;
            var dataset = $.extend(true, [], d);
            var substance = webgnome.model.get('spills').at(0).get('substance');
            var density = webgnome.model.get('spills').at(0).get('standard_density');
            var from_unit = webgnome.model.get('spills').at(0).get('units');
            var converter = new nucos.OilQuantityConverter();

            if (to_unit === from_unit) {
                return dataset;
            }

            if (!single) {
                for (var set in dataset) {
                    data = dataset[set].data;
                    for (i = 0; i < data.length; i++) {
                        arr = data[i];
                        for (k = 1; k < arr.length; k++) {
                            arr[k] = parseFloat(converter.Convert(arr[k], from_unit, density, 'kg/m^3', to_unit));
                        }
                    }
                }
            }
            else {
                data = dataset.data;
                for (i = 0; i < data.length; i++) {
                    arr = data[i];
                    for (k = 1; k < arr.length; k++) {
                        arr[k] = parseFloat(converter.Convert(arr[k], from_unit, density, 'kg/m^3', to_unit));
                    }
                }
            }

            return dataset;
        },

        renderGraphICS: function(dataset) {
            if (!_.isArray(dataset)) {
                dataset = this.dataset;
            }

            dataset = this.pruneDataset(dataset, ['avg_density',
                'amount_released',
                'avg_viscosity',
                'step_num',
                'time_stamp',
                'water_content',
                'non_weathering',
                'water_density',
                'water_viscosity',
                'dispersibility_difficult',
                'dispersibility_unlikely',
                'systems'
                ]);

            var icsUnits = this.$('.vol-units').val();
            dataset = this.convertDataset(dataset, icsUnits);
            this.$('#ics209 .yaxisLabel').text(icsUnits);

            if (_.isUndefined(this.graphICS)) {
                this.$('#ics209 .timeline .chart .canvas').on('plotselected', _.bind(this.ICSPlotSelect, this));

                // prevent the user from accidentally or purposfully unselecting
                // the time range.
                this.$('#ics209 .timeline .chart .canvas').on('plotunselected', _.bind(function(e, ranges) {
                    this.graphICS.setSelection(this.ICSSelection);
                }, this));

                var options = $.extend(true, {}, this.defaultChartOptions);
                options.grid.autoHighlight = false;
                options.series.stack = true;
                options.series.group = true;
                options.series.lines.fill = 1;
                options.colors = this.generateColorArray(dataset);
                options.selection = {mode: 'x', color: '#428bca'};
                options.crosshair = undefined;
                options.tooltip = false;
                options.needle = false;
                options.legend = false;

                this.graphICS = $.plot('#ics209 .timeline .chart .canvas', dataset, options);

                var compiled = '';

                for (var i = 0; i < dataset.length; i++) {
                    if (dataset[i].label !== 'Amount released') {
                        compiled += _.template(BreakdownTemplate, {
                            color: this.nameToColorMap[dataset[i].name],
                            width: 'auto',
                            label: dataset[i].label,
                            value: 0
                        });
                    }
                }

                this.$('.legend').html(compiled);
            }
            else {
                this.graphICS.setData(dataset);
                this.graphICS.setupGrid();
                this.graphICS.draw();

                if (this.ICSSelection) {
                    this.graphICS.setSelection(this.ICSSelection);
                }
            }
        },

        ICSPlotSelect: function(e, ranges) {
            var start_input = this.$('#ics209 #start_time');
            var end_input = this.$('#ics209 #end_time');
            var date_format = webgnome.config.date_format.moment;
            var start_time = moment(parseInt(ranges.xaxis.from, 10) / 1000, 'X');
            var end_time = moment(parseInt(ranges.xaxis.to, 10) / 1000, 'X');
            var step = webgnome.model.get('time_step');
            var inc = 0;
            var unit = '';

            if (step < 60) {
                // round to the nearest min
                inc = 1;
                unit = 'minutes';
            }
            else if (step <= 300) {
                // round to the nearest 5 min inc
                inc = 5;
                unit = 'minutes';
            }
            else if (step <= 600) {
                // round to the nearest 10 min inc
                inc = 10;
                unit = 'minutes';
            }
            else if (step <= 900) {
                // round to the nearest 15 min inc
                inc = 15;
                unit = 'minutes';
            }
            else if (step <= 1800) {
                // round to the nearest 30 min inc
                inc = 30;
                unit = 'minutes';
            }
            else {
                // round to the nearest 1 hour inc
                inc = 1;
                unit = 'hours';
            }

            start_time.round(inc, unit);
            end_time.round(inc, unit);

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

        ICSInputSelect: function() {
            var date_format = webgnome.config.date_format.moment;
            var model_start_time = webgnome.model.get('start_time');
            var start_input = this.$('#ics209 #start_time').val();
            var end_input = this.$('#ics209 #end_time').val();
            var time_span_hrs = 24;

            if (!start_input || !end_input) { return null; }

            var start_time = moment(start_input, date_format);
            var end_time = moment(end_input, date_format);
            var selection = {
                xaxis: {
                    from: start_time.unix() * 1000,
                    to: end_time.unix() * 1000
                }
            };

            if (!_.isUndefined(this.ICSSelection)) {
                selection.yaxis = {
                    from: this.ICSSelection.yaxis.from,
                    to: this.ICSSelection.yaxis.to
                };
            }
            else {
                selection.yaxis = {};
            }

            this.updateICSSelection(selection);
        },

        updateICSSelection: function(selection) {
            var start_input = this.$('#ics209 #start_time');
            var end_input = this.$('#ics209 #end_time');
            var date_format = webgnome.config.date_format.moment;
            var changed = true;

            if (!_.isUndefined(this.ICSSelection)) {
                if (selection.xaxis.to !== this.ICSSelection.xaxis.to ||
                        selection.xaxis.from !== this.ICSSelection.xaxis.from) {
                    start_input.val(moment(selection.xaxis.from / 1000, 'X').format(date_format));
                    end_input.val(moment(selection.xaxis.to / 1000, 'X').format(date_format));
                    changed = true;
                }
                else {
                    changed = false;
                }
            }
            else {
                start_input.val(moment(selection.xaxis.from / 1000, 'X').format(date_format));
                end_input.val(moment(selection.xaxis.to / 1000, 'X').format(date_format));
            }

            if (changed) {
                this.renderTableICS(selection);
                this.graphICS.setSelection(selection, true);
            }

            this.ICSSelection = selection;
        },

        renderTableICS: function(selection) {
            if (!_.has(selection, 'xaxis') && _.isUndefined(this.ICSSelection)) {
                return false;
            }
            else if (!_.has(selection, 'xaxis')) {
                selection = this.ICSSelection;
            }

            var start = selection.xaxis.from;
            var end = selection.xaxis.to;
            var from_units = webgnome.model.get('spills').at(0).get('units');
            var to_units = this.$('#ics209 .vol-units').val() === null ? from_units : this.$('#ics209 .vol-units').val();

            var converter = new nucos.OilQuantityConverter();
            var substance = webgnome.model.get('spills').at(0).get('substance');
            var density = webgnome.model.get('spills').at(0).get('standard_density');
            var dataset = this.pluckDataset(this.dataset, ['natural_dispersion', 'amount_released', 'chem_dispersed', 'evaporated', 'floating', 'burned', 'skimmed', 'sedimentation', 'beached', 'dissolution']);

            var report = {
                spilled: 0,
                evaporated: 0,
                chem_dispersed: 0,
                burned: 0,
                skimmed: 0,
                floating: 0,
                amount_released: 0,
                natural_dispersion: 0,
                other_natural: 0,
                sedimentation: 0,
                dissolution: 0,
                beached: 0
            };
            var cumulative = _.clone(report);
            var low = _.clone(report);
            var high =  _.clone(report);

            for (var set in dataset) {
                for (var step in dataset[set].data) {
                    if (dataset[set].data[step][0] >= start && dataset[set].data[step][0] <= end) {
                        var previous = 0;

                        if (dataset[set].data[step - 1]) {
                            previous = Math.round(parseFloat(converter.Convert(dataset[set].data[step - 1][1], from_units, density, 'kg/m^3', to_units)));
                        }

                        var current = Math.round(parseFloat(converter.Convert(dataset[set].data[step][1], from_units, density, 'kg/m^3', to_units)));
                        report[dataset[set].name] += current - previous;
                    }
                }

                for (var step2 in dataset[set].data) {
                    if (dataset[set].data[step2][0] <= end) {
                        cumulative[dataset[set].name] = Math.round(parseFloat(converter.Convert(dataset[set].data[step2][1], from_units, density, 'kg/m^3', to_units)));
                    }
                }

                for (var step3 in dataset[set].low) {
                    if (dataset[set].low[step3][0] <= end) {
                        low[dataset[set].name] = Math.round(parseFloat(converter.Convert(dataset[set].low[step3][1], from_units, density, 'kg/m^3', to_units)));
                    }
                }

                for (var step4 in dataset[set].high) {
                    if (dataset[set].high[step4][0] <= end) {
                        high[dataset[set].name] = Math.round(parseFloat(converter.Convert(dataset[set].high[step4][1], from_units, density, 'kg/m^3', to_units)));
                    }
                }
            }

            cumulative.other_natural += cumulative.sedimentation;
            cumulative.other_natural += cumulative.dissolution;
            low.other_natural += low.sedimentation;
            low.other_natural += low.dissolution;
            high.other_natural += high.sedimentation;
            high.other_natural += high.dissolution;
            report.other_natural += report.sedimentation;
            report.other_natural += report.dissolution;

            report.floating = report.floating > 0 ? report.floating : 0;

            var amount_type = 'Volume Spilled';
            var mass_units = ['kg', 'metric ton', 'ton'];

            if (mass_units.indexOf(to_units) > -1) {
                amount_type = 'Mass Spilled';
            }

            var compiled = _.template(ICSTemplate, {
                amount_type: amount_type,
                report: report,
                cumulative: cumulative,
                low: low,
                high: high,
                units: to_units
            });

            this.$('#ics209 .ics-table').html(compiled);
        },

        printTableICS: function() {
            window.print();
        },

        tableToCSV: function(table, header) {
            var csv = [];
            var rows = table.find('tr');

            rows.each(function(row) {
                var csv_row = [];
                var cells = $(rows[row]).find('th, td');

                cells.each(function(cell){
                    csv_row.push($(cells[cell]).text());
                });

                csv.push(csv_row.join(','));
            });

            if (!_.isUndefined(header)) {
                var cols = csv[0].split(',').length;

                header.each(function(row) {
                    var cells = $(header[row]).text().split(':');
                    var csv_row = [cells[0] + ':', cells[1]];

                    for (var i = 0; i < cols.length - cells.length; i++) {
                        csv_row.push(' ');
                    }

                    csv.unshift(csv_row.join(','));
                });
            }

            return csv.join('\r\n');
        },

        convertUnixToDateTimeCSV: function(datarow) {
            var datarowcp = datarow.slice();
            var unix = datarow[0] / 1000;
            var date = moment.unix(unix).format(webgnome.config.date_format.moment);

            datarowcp[0] = date;

            return datarowcp;
        },

        convertMomentToDateTimeCSV: function(time) {
            return moment(time).toISOString();
        },

        modelInfoCSV: function() {
            var csv = '';
            var data = this.$('.info div');

            data.each(_.bind(function(i, el, arr) {
                var obj = this.$(el);
                var headerText = obj.children('label').text().replace(/:/g, '');
                var valueText = obj.clone().children(':not(span)').remove().end().text().replace(/,|°/g, '');

                csv += headerText + ',' + valueText + '\r\n';
            }, this));

            return csv;
        },

        exportCSV: function() {
            var tabName, dataset, csv, header, dataUnits;
            var parentTabName = this.$('.nav-tabs li.active a').attr('href');

            if (!_.isUndefined(this.$(parentTabName + ' .tab-pane.active').attr('id'))) {
                tabName = this.$(parentTabName + ' .tab-pane.active').attr('id');
            }
            else {
                tabName = parentTabName.substring(1);
            }

            var filename = webgnome.model.get('name') + '_' + tabName;
            var datasetName = this.tabToLabelMap[tabName];

            if (!_.isUndefined(datasetName)) {
                dataUnits = this.$('.tab-pane.active .yaxisLabel').html();
                dataset = this.pluckDataset(webgnome.mass_balance, [datasetName])[0];
                var dataArr = dataset.data;

                header = "datetime,nominal(" + dataUnits + "),high(" + dataUnits + "),low(" + dataUnits + ")";
                csv = [header];

                for (var i = 0; i < dataArr.length; i++) {
                    var datasetrow = this.convertUnixToDateTimeCSV(dataArr[i]);
                    datasetrow.splice(2,1);

                    var row = datasetrow.join(",");
                    csv.push(row);
                }

                csv = csv.join('\r\n');
            }
            else if (this.$('#' + tabName + ' table').length !== 0){
                var table = this.$('#' + tabName + ' table');
                csv = this.tableToCSV(table);
            }
            else {
                swal({
                    title: 'CSV export unavailable!',
                    text: 'Cannot export CSV for this tab',
                    type: 'warning'
                });

                return;
            }

            var metaData = this.modelInfoCSV();

            csv = encodeURI('data:text/csv;charset=utf-8,' + metaData + '\r\n' + csv);

            this.downloadContent(csv, filename + '.csv');
        },

        exportHTML: function(e) {
            var content;
            var modelInfo = this.$('.model-settings').html().replace(/°/g, '&deg;');
            var parentTabName = this.$('.nav-tabs li.active a').attr('href');
            var tabName;

            if (!_.isUndefined(this.$(parentTabName + ' .tab-pane.active').attr('id'))) {
                tabName = this.$(parentTabName + ' .tab-pane.active').attr('id');
            }
            else {
                tabName = parentTabName;
            }

            var tableHTML = this.tableToHTML(this.$(tabName + ' table'));
            var filename = webgnome.model.get('name') + '_';

            if (this.$(tabName + ' table').length !== 0) {
                content = modelInfo + tableHTML;
                var source = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
                this.downloadContent(source, filename + tabName.substring(1) + '.html');
            }
            else {
                this.modelInfo = modelInfo;
                this.tabName = tabName;
                this.fileName = filename;

                this.saveGraphImage(null, _.bind(function(img) {
                    var content = _.template(ExportTemplate, {body: this.modelInfo + '<img src="' + img + '"/>'});
                    var source = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
                    this.downloadContent(source, this.fileName + this.tabName + '.html');
                }, this));
            }
        },

        tableToHTML: function(table, header) {
            if (_.isUndefined(header)) {
                header = '';
            }

            return _.template(ExportTemplate, {body: header.replace(/°/g, '') + '<table class="table table-striped">' + table.html() + '</table>'});
        },

        validateDataset: function() {
            if (this.dataset) {
                return this.dataset[0].data.length === webgnome.cache.length;
            }
            return true;
        },

        buildDataset: function(step) {
            if (_.has(step.get('WeatheringOutput'), 'nominal')) {
                this.formatStep(step);

                if (this.validateDataset()) {
                    this.frame++;
                    this.renderGraphs();
                }
                else {
                    this.stopListening(webgnome.cache, 'step:received', this.buildDataset);
                    delete this.dataset;
                    this.frame = 0;
                    this.load();
                }
            }
            else {
                swal({
                    title: 'Model Output Error',
                    text: 'No weathering output was found for step #' + step.get('step_num'),
                    type: 'error'
                });
            }
        },

        formatStep: function(step) {
            var nominal = step.get('WeatheringOutput').nominal;

            this.uncertainityExists = !_.isNull(step.get('WeatheringOutput').high);

            var high = _.isNull(step.get('WeatheringOutput').high) ? nominal : step.get('WeatheringOutput').high;
            var low = _.isNull(step.get('WeatheringOutput').low) ? nominal : step.get('WeatheringOutput').low;

            if (_.isUndefined(this.dataset)) {
                this.dataset = [];
                var keyOrder = [ //beached and off maps are added in below
                    'amount_released',
                    'evaporated',
                    'natural_dispersion',
                    'sedimentation',
                    'dissolution', 
                    'observed_beached',                    
                    'skimmed',                   
                    'chem_dispersed',  
                    'burned',                    
                ];

                var titles = _.clone(nominal);

                if (webgnome.model.get('mode') !== 'adios' &&
                        webgnome.model.get('mode') !== 'roc') {
                    keyOrder.splice(keyOrder.length-3, 0, 'beached', 'off_maps');
                }
                else {
                    delete titles.off_maps;
                    delete titles.beached;
                }

                var titlesKeys = Object.keys(titles);
                keyOrder = _.union(keyOrder, titlesKeys);
                var keys = keyOrder.filter(function(el, i, arr) {
                    return !_.isUndefined(titles[el]);
                });

                keys.push('water_density', 'water_viscosity',
                          'dispersibility_difficult',
                          'dispersibility_unlikely');

                for (var type in keys) {
                    this.dataset.push({
                        data: [],
                        high: [],
                        low: [],
                        nominal: [],
                        label: this.formatLabel(keys[type]),
                        name: keys[type],
                        direction: {
                            show: false
                        },
                        needle: {
                            label: _.bind(this.formatNeedleLabel, this),
                            formatX: _.bind(this.formatNeedleTime, this)
                        }
                    });
                }

                this.dataset.push({
                    name: 'secondtime',
                    data: [],
                    high: [],
                    low: [],
                    nominal: [],
                    xaxis: 2
                });
            }

            var date = moment(step.get('WeatheringOutput').time_stamp);
            var units = webgnome.model.get('spills').at(0).get('units');
            var density = webgnome.model.get('spills').at(0).get('substance').get('standard_density');
            var converter = new nucos.OilQuantityConverter();
            var water = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.water.Water'});
            var waterDensity = water.getDensity();

            for (var set in this.dataset) {
                var low_value, nominal_value, high_value;
                if (['natural_dispersion',
                     'chem_dispersed',
                     'evaporated',
                     'floating',
                     'amount_released',
                     'skimmed',
                     'burned',
                     'beached',
                     'boomed',
                     'sedimentation',
                     'dissolution',
                     'off_maps',
                     'observed_beached'
                     ].indexOf(this.dataset[set].name) !== -1) {
                    var min = _.min(step.get('WeatheringOutput'), this.runIterator(set), this);
                    low_value = min[this.dataset[set].name];
                    low_value = converter.Convert(low_value, 'kg', density, 'kg/m^3', units);

                    var max = _.max(step.get('WeatheringOutput'), this.runIterator(set), this);
                    high_value = max[this.dataset[set].name];
                    high_value = converter.Convert(high_value, 'kg', density, 'kg/m^3', units);

                    nominal_value = nominal[this.dataset[set].name];
                    nominal_value = converter.Convert(nominal_value, 'kg', density, 'kg/m^3', units);
                }
                else if (this.dataset[set].name === 'avg_viscosity') {
                    // Converting viscosity from m^2/s to cSt before assigning the values to be graphed
                    low_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', low[this.dataset[set].name]);
                    nominal_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', nominal[this.dataset[set].name]);
                    high_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', high[this.dataset[set].name]);
                }
                else if (this.dataset[set].name === 'water_content') {
                    // Convert water content into a % it's an easier unit to understand
                    // and graphs better
                    low_value = low[this.dataset[set].name] * 100;
                    nominal_value = nominal[this.dataset[set].name] * 100;
                    high_value = high[this.dataset[set].name] * 100;
                }
                else if (this.dataset[set].name === 'water_density') {
                    low_value = waterDensity;
                    nominal_value = waterDensity;
                    high_value = waterDensity;
                }
                else if (this.dataset[set].name === 'water_viscosity') {
                    low_value = 1;
                    nominal_value = 1;
                    high_value = 1;
                }
                else if (this.dataset[set].name === 'dispersibility_difficult') {
                    low_value = 2000;
                    nominal_value = 2000;
                    high_value = 2000;
                }
                else if (this.dataset[set].name === 'dispersibility_unlikely') {
                    low_value = 10000;
                    nominal_value = 10000;
                    high_value = 10000;
                }
                else {
                    low_value = low[this.dataset[set].name];
                    nominal_value = nominal[this.dataset[set].name];
                    high_value = high[this.dataset[set].name];
                }

                this.dataset[set].high.push([date.unix() * 1000, high_value]);
                this.dataset[set].low.push([date.unix() * 1000, low_value]);
                this.dataset[set].data.push([date.unix() * 1000, nominal_value, 0, low_value, high_value]);
                this.dataset[set].nominal.push([date.unix() * 1000, nominal_value]);

                webgnome.mass_balance = this.dataset;
            }
        },

        checkDataExists: function(datasetNameArr) {
            if (!_.isUndefined(this.dataset) && this.dataset[datasetNameArr]) {
                return true;
            }

            return false;
        },

        addAxesValue: function(dataset) {
            var data = _.clone(dataset);

            for (var key in data) {
                data[key].xaxis = 2;
            }

            return dataset.concat(data);
        },

        runIterator: function(set) {
            return (function(run) {
                if (!_.isNull(run)) {
                    return run[this.dataset[set].name];
                }
            });
        },

        formatNeedleLabel: function(text, n) {
            var num = parseFloat(parseFloat(text).toPrecision(this.dataPrecision)).toString();
            var units;

            if (n === 1) {
                units = $('#weatherers .tab-pane:visible .yaxisLabel').text();
            }
            else {
                units = $('#weatherers .tab-pane:visible .secondYaxisLabel').text();
            }

            return num + ' ' + units;
        },

        formatNeedleTime: function(text) {
            var unix_time = parseInt(text, 10);

            let ret = moment(unix_time).format(webgnome.config.date_format.moment);
            return ret;
        },

        pruneDataset: function(dataset, leaves) {
            return _.filter(dataset, function(set) {
                return leaves.indexOf(set.name) === -1;
            });
        },

        pluckDataset: function(dataset, leaves) {
            return _.filter(dataset, function(set) {
                return leaves.indexOf(set.name) !== -1;
            });
        },

        formatLabel: function(label) {
            if (label==='off_maps') { label='off_map'; }

            return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ');
        },

        formatNumber: function(number) {
            return parseFloat(number.toPrecision(this.dataPrecision));
        },

        /**
         * Calculate the amount of oil released given the release start and end time in relation to the models end time.
         * @param  {Collection} spills  Collection of spill objects
         * @param  {Object} model       gnome model object
         * @return {Integer}            Amount of oil released in the models time period, same unit as spill.
         */
        calcAmountReleased: function(spills, model) {
            var init_release = this.findInitialRelease(spills);
            var total_amount = 0;

            spills.forEach(_.bind(function(spill) {
                var release_time = moment(spill.get('release').get('release_time')).unix();

                if (init_release > release_time) {
                    init_release = release_time;
                }

                var amount = spill.get('amount');
                var on = spill.get('on');
                var release_start = moment(spill.get('release').get('release_time')).unix();
                var release_end = moment(spill.get('release').get('end_release_time')).unix();

                if (release_start === release_end) {
                    release_end += 2;
                }

                var model_end = moment(model.get('start_time')).add(model.get('duration'), 's').unix();

                // find the rate of the release per second.
                var release_duration = release_end - release_start;
                var release_per_second = amount / release_duration;

                // find the percentage of the release time that fits in the model
                var release_run_time;

                if (model_end > release_end) {
                    release_run_time = release_duration;
                }
                else {
                    var overlap = release_end - model_end;
                    release_run_time = release_duration - overlap;
                }

                if (on) {
                    if (release_run_time < 0) {
                        release_run_time = 0;
                    }

                    total_amount += release_run_time * release_per_second;
                }
            }, this));

            return total_amount;
        },

        findInitialRelease: function(spills) {
            var release_init = moment(spills.at(0).get('release').get('release_time')).unix();

            spills.forEach(function(spill) {
                var release_start = moment(spill.get('release').get('release_time')).unix();
                if (release_start < release_init) {
                    release_init = release_start;
                }
            });

            return release_init;
        },

        getActiveElement: function(e) {
            var parentTabName = this.$('.nav-tabs li.active a').attr('href');
            var element, name;

            if (!_.isUndefined(this.$(parentTabName + ' .tab-pane.active').attr('id'))) {
                element = this.$(parentTabName + ' .tab-pane.active .timeline');
                name = this.$(parentTabName + ' .tab-pane.active').attr('id');
            }
            else if (this.$(parentTabName + ' .timeline').length !== 0) {
                element = this.$(parentTabName + ' .timeline');

                if (parentTabName === '#budget-graph') {
                    element = this.$(parentTabName);
                }

                name = parentTabName.substring(1);
            }
            else {
                element = this.$(parentTabName + ' table');
                name = parentTabName.substring(1);
            }

            return {element: element, name: name};
        },

        saveGraphImage: function(e, cb) {
            var obj = this.getActiveElement();

            html2canvas(obj.element, {
                onrendered: _.bind(function(canvas) {
                    var ctx = canvas.getContext('2d');
                    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var compositeOperation = ctx.globalCompositeOperation;
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    var img = canvas.toDataURL('image/png');

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(data, 0, 0);
                    ctx.globalCompositeOperation = compositeOperation;

                    var currentTab = this.$('.tab-pane.active').attr('id');
                    var name = webgnome.model.get('name') ? webgnome.model.get('name') + '_' + obj.name : obj.name;

                    if (_.isUndefined(cb)) {
                        this.downloadContent(img, name);
                    }
                    else {
                        cb(img);
                    }
                }, this)
            });
        },

        downloadContent: function(source, filename) {
            //webgnome.invokeSaveAsDialog(blob, this.capture_opts.name+'.'+this.capture_opts.format);
            var pom = document.createElement('a');
            pom.href = source;
            pom.download = filename;

            document.body.appendChild(pom); //required in FF, optional for Chrome
            pom.target="_self" ; //required in FF, optional for Chrome
            pom.click();
        },

        printGraphImage: function(e) {
            window.print();
        },

        close: function() {
            $('.xdsoft_datetimepicker').remove();
            $(window).off('scroll', this.tableOilBudgetStickyHeader);

            this.stopListening(webgnome.cache, 'step:received', this.buildDataset);

            webgnome.cache.off('rewind', this.reset, this);
            webgnome.cache.sendHalt();

            this.rendered = false;
            Backbone.View.prototype.close.call(this);
        }
    });

    return fateView;
});
