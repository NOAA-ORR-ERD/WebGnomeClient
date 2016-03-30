define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'moment',
    'ol',
    'masonry',
    'sweetalert',
    'nucos',
    'text!templates/model/setup.html',
    'views/modal/form',
    'model/gnome',
    'views/form/model',
    'views/panel/wind',
    'views/panel/water',
    'views/panel/map',
    'views/panel/diffusion-h',
    'views/panel/current',
    'views/panel/spill',

    'views/form/location',
    'views/default/map',
    'views/form/response/type',
    'model/weatherers/manual_beaching',
    'views/form/beached',
    'text!templates/panel/beached.html',
    'text!templates/panel/response.html',
    'views/form/response/disperse',
    'views/form/response/insituBurn',
    'views/form/response/skim',
    'model/outputters/trajectory',
    'model/outputters/weathering',
    'model/weatherers/evaporation',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection',
    'flotstack',
    'flotgantt',
    'flotextents',
    'flotnavigate',
    'jqueryui/sortable'
], function($, _, Backbone, BaseView, module, moment, ol, Masonry, swal, nucos, AdiosSetupTemplate, FormModal, GnomeModel, GnomeForm,
    WindPanel, WaterPanel, MapPanel, DiffusionPanel, CurrentPanel, SpillPanel,
    LocationForm, OlMapView, ResponseTypeForm, BeachedModel, BeachedForm, BeachedPanelTemplate, ResponsePanelTemplate, ResponseDisperseView, ResponseBurnView, ResponseSkimView,
    TrajectoryOutputter, WeatheringOutputter, EvaporationModel){
    'use strict';
    var adiosSetupView = BaseView.extend({
        className: 'page setup',
        current_extents: [],

        events: function(){
            return _.defaults({
                'click .response .add': 'clickResponse',
                'click .response .single .edit': 'loadResponse',
                'click .response .single': 'loadResponse',
                'click .response .single .trash': 'deleteResponse',
                'mouseover .response .single': 'hoverResponse',
                'mouseout .response .response-list': 'unhoverResponse',
                'blur input': 'updateModel',
                'click .eval': 'evalModel',
                'click .rewind': 'rewindClick',
                'click .beached .add': 'clickBeached',
                'click .advanced-edit': 'clickModel'
            }, BaseView.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                if(webgnome.model.get('name') === 'ADIOS Model_'){
                    webgnome.router.navigate('/adios', true);
                } else {
                    $('body').append(this.$el);
                    this.render();
                }
            } else {
                if(_.has(webgnome, 'cache')){
                    webgnome.cache.rewind();
                }
                webgnome.model = new GnomeModel();
                $('body').append(this.$el);
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        this.render();
                    }, this)
                });
            }
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate, {
                start_time: moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: webgnome.model.formatDuration(),
                name: !_.isUndefined(webgnome.model.get('name')) ? webgnome.model.get('name') : ''
            });
            this.$el.append(compiled);
            BaseView.prototype.render.call(this);
            this.$('.model-objects').append(
                new WindPanel().$el,
                new WaterPanel().$el,
                new MapPanel().$el,
                new DiffusionPanel().$el,
                new CurrentPanel().$el,
                new SpillPanel().$el
            );
            this.initMason();

            webgnome.model.on('sync', this.updateObjects, this);
            this.updateObjects();

            this.$('.icon').tooltip({
                placement: 'bottom'
            });
            this.$('.datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('.datetime').datetimepicker('show');
            }, this));
            this.renderTimeline();
        },

        renderTimeline: function(){
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
            this.$('.timeline').css('height', height + 'px');

            var timeline = {extents: { show: true }, data: [], extentdata: timelinedata};

            this.timeline = $.plot('.timeline', [baseline,timeline], {
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

        showHelp: function(){
            var compiled = '<div class="gnome-help" title="Click for help"></div>';
            this.$('h2:first').append(compiled);
            this.$('h2:first .gnome-help').tooltip();
        },

        clickModel: function(){
            var form = new GnomeForm(null, webgnome.model);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                this.$el.html('');
                this.render();
            }, this));
            form.render();
        },

        clickDate: function(){
            this.$('.datetime').trigger('click');
        },

        initMason: function(){
            if(this.mason){
                this.mason.destroy();
            } else {
                $(window).on('resize', _.bind(this.initMason, this));
            }

            var container = this.$('.model-objects').get(0);
            this.mason = new Masonry(container, {
                columnWidth: function(colwidth){
                    return $('.setup .col-md-6').outerWidth() / 2;
                }(),
                item: '.object',
            });
        },

        evalModel: function(e){
            e.preventDefault();
            if (!webgnome.model.isValid()){
                var spillNames = webgnome.model.validationError;
                swal({
                    html: true,
                    title: "Spill(s) are outside map bounds!",
                    text: "These spill(s) originate outside of the map bounds: <br />" + spillNames,
                    type: 'error',
                });
            } else {
                webgnome.router.navigate('model', true);
            }
        },

        rewindClick: function(e){
            if(e){ e.preventDefault();}
            webgnome.cache.rewind();
        },

        updateModel: function(){
            var name = this.$('#name').val();
            webgnome.model.set('name', name);
            var start_time = moment(this.$('.datetime').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            webgnome.model.set('start_time', start_time);

            var days = this.$('#days').val();
            var hours = this.$('#hours').val();
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            webgnome.model.set('duration', duration);

            webgnome.model.get('weatherers').forEach(function(weatherer){
                if(weatherer.get('obj_type').indexOf('cleanup') === -1){
                    weatherer.set('active_start', webgnome.model.get('start_time'));
                    weatherer.set('active_stop', moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's').format('YYYY-MM-DDTHH:mm:ss'));
                }
            });

            webgnome.model.save(null, {
                validate: false,
                success: _.bind(function(){
                    this.updateSpill();
                    this.updateResponse();
                }, this)
            });
        },

        updateModelValues: function(e){
            var name = webgnome.model.get('name');
            var start_time = moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment);
            var durationAttrs = webgnome.model.formatDuration();

            this.$('#name').val(name);
            this.$('#start_time').val(start_time);
            this.$('#days').val(durationAttrs.days);
            this.$('#hours').val(durationAttrs.hours);
        },

        updateObjects: function(){
            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.panel-heading .advanced-edit').tooltip({
                title: 'Advanced Edit',
                delay: delay,
                container: 'body'
            });

            this.mason.layout();
        },

        clickResponse: function(){
            var typeForm = new ResponseTypeForm();
            typeForm.render();
            typeForm.on('hidden', typeForm.close);
        },

        updateResponse: function(weatherers){
            if (_.isUndefined(weatherers)){
                weatherers = webgnome.model.get('weatherers').models;
            }
            var timeSeries = this.timeSeries;
            var filteredNames = ["ChemicalDispersion", "Skimmer", "Burn"];
            this.responses = [];
            for (var i = 0; i < weatherers.length; i++){
                if (filteredNames.indexOf(weatherers[i].parseObjType()) !== -1 && weatherers[i].get('name') !== '_natural'){
                    this.responses.push(weatherers[i]);
                }
            }
            if (this.responses.length > 0){
                this.$('.response .panel').addClass('complete');
                var compiled = _.template(ResponsePanelTemplate, {responses: this.responses});

                this.$('.response').removeClass('col-md-3').addClass('col-md-6');
                this.$('.response .panel-body').html(compiled);
                this.$('.response .panel-body').show();

                this.graphReponses(this.responses);

            } else {
                this.$('.response .panel').removeClass('complete');
                this.$('.response .panel-body').hide().html('');
                this.$('.response').removeClass('col-md-6').addClass('col-md-3');
            }
        },

        graphReponses: function(responses){
            var yticks = [];
            var dataset = [];
            var colors = {
                'gnome.weatherers.cleanup.Burn': '#CB4B4B',
                'gnome.weatherers.cleanup.ChemicalDispersion': '#AFD8F8',
                'gnome.weatherers.cleanup.Skimmer': '#EDC240'
            };
            var t = responses.length;
            for (var i in responses){
                var responseObjType = responses[i].get('obj_type').split(".");
                var startTime = responses[i].get('active_start') !== '-inf' ? moment(responses[i].get('active_start')).unix() * 1000 : moment(webgnome.model.get('start_time')).unix() * 1000;
                var endTime = responses[i].get('active_stop') !== 'inf' ? moment(responses[i].get('active_stop')).unix() * 1000 : moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's').unix() * 1000;

                yticks.push([t, responses[i].get('name')]);
                dataset.push({
                    data: [[startTime, t, endTime, responses[i].get('id')]],
                    color: colors[responses[i].get('obj_type')],
                    lines: {
                        show: false,
                        fill: false
                    },
                    direction: {
                        show: false
                    },
                    id: responses[i].get('id')
                });
                t--;

            }

            if(!_.isUndefined(dataset)){
                this.responseDataset = dataset;
                setTimeout(_.bind(function(){
                    this.renderResponseGraph(dataset, yticks);
                }, this), 2);
            }

        },

        renderResponseGraph: function(dataset, yticks){
            var start_time = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
            var numOfTimeSteps = webgnome.model.get('num_time_steps') - 1;
            var timeStep = webgnome.model.get('time_step');
            var end_time = moment.unix(start_time / 1000).add(numOfTimeSteps * timeStep, 's').unix() * 1000;
            this.responsePlot = $.plot('.response .chart .canvas', dataset, {
                series: {
                    editMode: 'v',
                    editable: true,
                    gantt: {
                        active: true,
                        show: true,
                        barHeight: 0.5
                    }
                },
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    hoverable: true
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    min: start_time,
                    max: end_time
                },
                yaxis: {
                    min: 0.5,
                    max: yticks.length + 0.5,
                    ticks: yticks
                },
                needle: false
            });
        },

        hoverResponse: function(e){
            var id = $(e.target).data('id');
            if (_.isUndefined(id)){
                id = $(e.target).parents('.single').data('id');
            }
            var coloredSet = [];
            for(var dataset in this.responseDataset){
                var ds = _.clone(this.responseDataset[dataset]);
                if (this.responseDataset[dataset].id !== id){
                    ds.color = '#ddd';
                }

                coloredSet.push(ds);
            }
            this.responsePlot.setData(coloredSet);
            this.responsePlot.draw();
        },

        unhoverResponse: function(){
            this.responsePlot.setData(this.responseDataset);
            this.responsePlot.draw();
        },

        loadResponse: function(e){
            e.stopPropagation();
            var responseId = $(e.target).parents('.single').data('id');
            var response = webgnome.model.get('weatherers').get(responseId);
            var responseView;
            var nameArray = response.get('obj_type').split('.');
            switch (nameArray[nameArray.length - 1]){
                case "ChemicalDispersion":
                    responseView = new ResponseDisperseView(null, response);
                    break;
                case "Burn":
                    responseView = new ResponseBurnView(null, response);
                    break;
                case "Skimmer":
                    responseView = new ResponseSkimView(null, response);
                    break;
            }

            responseView.on('save', _.bind(function(){
                webgnome.model.save(null, {validate: false});
                responseView.on('hidden', responseView.close);
            }, this));
            responseView.on('wizardclose', responseView.close);
            responseView.render();
        },

        deleteResponse: function(e){
            e.stopPropagation();
            var id = $(e.target).parents('.single').data('id');
            var response = webgnome.model.get('weatherers').get(id);
            swal({
                title: 'Delete "' + response.get('name') + '"',
                text: 'Are you sure you want to delete this response?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }, _.bind(function(isConfirmed){
                if(isConfirmed){
                    webgnome.model.get('weatherers').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

        clickBeached: function(){
            var beached = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.manual_beaching.Beaching'});
            if (_.isUndefined(beached) || beached.length === 0){
                beached = new BeachedModel();
            }
            var beachedForm = new BeachedForm({}, beached);
            beachedForm.on('hidden', beachedForm.close);
            beachedForm.on('save', _.bind(function(){
                if(beached.get('timeseries').length === 0){
                    webgnome.model.get('weatherers').remove(beached);
                } else {
                    webgnome.model.get('weatherers').add(beached, {merge: true});
                }
                
                webgnome.model.save({
                    success: _.bind(function(){
                        this.updateBeached();
                    }, this)
                });
                    
            }, this));
            beachedForm.render();
        },

        updateBeached: function(){
            var beached = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.manual_beaching.Beaching'});
            if (!_.isUndefined(beached) && beached.get('timeseries').length > 0){
                var compiled, dataset;
                this.$('.beached .panel').addClass('complete');
                if (beached.get('timeseries').length === 1){
                    var amountBeached = beached.get('timeseries')[0][1];
                    var singleDate = moment(beached.get('timeseries')[0][0]).format(webgnome.config.date_format.moment);
                    compiled = _.template( BeachedPanelTemplate, {
                        amount: amountBeached,
                        units: beached.get('units'),
                        date: singleDate
                    });
                    this.$('.beached').removeClass('col-md-6').addClass('col-md-3');
                } else if (beached.get('timeseries').length > 1) {
                    compiled = '<div class="chart"><div class="axisLabel yaxisLabel">' + beached.get('units') + '</div><div class="axisLabel xaxisLabel">Time</div><div class="canvas"></div></div>';

                    var ts = beached.get('timeseries');
                    var data = [];

                    for (var entry in ts){
                        var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                        data.push([parseInt(date, 10), parseInt(ts[entry][1], 10)]);
                    }

                    dataset = [{
                        data: data,
                        color: '#9CD1FF',
                        hoverable: true,
                        lines: {
                            show: true,
                            fill: true
                        },
                        points: {
                            show: false
                        },
                        direction: {
                            show: false
                        }
                    }];

                    this.$('.beached').removeClass('col-md-3').addClass('col-md-6');
                }
                this.$('.beached .panel-body').html(compiled);
                this.$('.beached .panel-body').show();

                if (dataset) {
                    setTimeout(_.bind(function(){
                        this.beachedPlot = $.plot('.beached .chart .canvas', dataset, {
                            grid: {
                                borderWidth: 1,
                                borderColor: '#ddd'
                            },
                            xaxis: {
                                mode: 'time',
                                timezone: 'browser',
                                tickColor: '#ddd'
                            },
                            series: {
                                stack: true,
                                group: true,
                                groupInterval: 1,
                                lines: {
                                    show: true,
                                    fill: true,
                                    lineWidth: 2
                                },
                                shadowSize: 0
                            }
                        });
                    }, this), 1);
                }
            } else {
                this.$('.beached').removeClass('col-md-6').addClass('col-md-3');
                this.$('.beached .panel').removeClass('complete');
                this.$('.beached .panel-body').hide().html('');
            }
        },
        
        close: function(){
            $('.xdsoft_datetimepicker').remove();
            if(!_.isUndefined(this.windPlot)){
                this.windPlot.shutdown();
            }
            if(webgnome.model){
                webgnome.model.off('sync', this.updateObjects, this);
            }

            webgnome.cache.off('rewind', this.rewind, this);

            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});
