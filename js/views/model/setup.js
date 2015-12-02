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
    'model/gnome',
    'model/environment/wind',
    'model/movers/wind',
    'views/form/wind',
    'text!templates/panel/wind.html',
    'model/map/map',
    'views/form/map/type',
    'views/form/map/param',
    'text!templates/panel/map.html',
    'model/environment/water',
    'views/form/water',
    'text!templates/panel/water.html',
    'model/spill',
    'views/form/spill/type',
    'text!templates/panel/spill.html',
    'views/form/spill/continue',
    'views/form/spill/instant',
    'views/form/oil/library',
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
    'flotnavigate'
], function($, _, Backbone, BaseView, module, moment, ol, Masonry, swal, nucos, AdiosSetupTemplate, GnomeModel,
    WindModel, WindMoverModel, WindForm, WindPanelTemplate,
    MapModel, MapTypeForm, ParamMapForm, MapPanelTemplate,
    WaterModel, WaterForm, WaterPanelTemplate,
    SpillModel, SpillTypeForm, SpillPanelTemplate, SpillContinueView, SpillInstantView, OilLibraryView,
    LocationForm, OlMapView, ResponseTypeForm, BeachedModel, BeachedForm, BeachedPanelTemplate, ResponsePanelTemplate, ResponseDisperseView, ResponseBurnView, ResponseSkimView,
    TrajectoryOutputter, WeatheringOutputter, EvaporationModel){
    'use strict';
    var adiosSetupView = BaseView.extend({
        className: 'page setup',
        current_extents: [],

        events: function(){
            return _.defaults({
                'click .wind .add': 'clickWind',
                'click .water .add': 'clickWater',
                'click .spill .add': 'clickSpill',
                'click .map .perm-add': 'clickMap',
                'click .map .add': 'editMap',
                'click .spill .single .edit': 'loadSpill',
                'click .spill .single': 'loadSpill',
                'click .spill .single .trash': 'deleteSpill',
                'click .substance-info': 'renderOilLibrary',
                'mouseover .spill .single': 'hoverSpill',
                'mouseout .spill .spill-list': 'unhoverSpill',
                'click .location': 'clickLocation',
                'click .response .add': 'clickResponse',
                'click .response .single .edit': 'loadResponse',
                'click .response .single .trash': 'deleteResponse',
                'mouseover .response .single': 'hoverResponse',
                'mouseout .response .response-list': 'unhoverResponse',
                'blur input': 'updateModel',
                'click .eval': 'evalModel',
                'click .rewind': 'rewindClick',
                'click .beached .add': 'clickBeached'
            }, BaseView.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            $('body').append(this.$el);
            if(webgnome.hasModel()){
                this.render();
            } else {
                if(_.has(webgnome, 'cache')){
                    webgnome.cache.rewind();
                }
                webgnome.model = new GnomeModel();
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        this.render();
                    }, this)
                });
            }
            webgnome.cache.on('rewind', this.rewind, this);
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate, {
                start_time: moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: webgnome.model.formatDuration(),
                name: !_.isUndefined(webgnome.model.get('name')) ? webgnome.model.get('name') : ''
            });
            this.$el.append(compiled);
            BaseView.prototype.render.call(this);
            this.initMason();

            setTimeout(_.bind(function(){
                webgnome.model.on('sync', this.updateObjects, this);
                //webgnome.model.on('sync', this.updateSpill, this);
                this.updateWind();
                this.updateLocation();
                this.updateWater();
                this.updateSpill();
                this.updateCurrent();
                this.updateObjects();
            }, this), 1);

            this.$('.icon').tooltip({
                placement: 'bottom'
            });
            this.$('.datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('.datetime').datetimepicker('show');
            }, this));
            this.renderTimeline();
        },

        renderTimeline: function(){
            var start = parseInt(moment(webgnome.model.get('start_time')).format('x'));
            var end = parseInt(start + (webgnome.model.get('duration') * 1000));
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

        rewind: function(){
            this.$('.stage-4').hide();
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

        showFateObjects: function(){
            this.$('.model-objects > div').hide().addClass('disabled');
            this.$('.wind').show().removeClass('disabled');
            this.$('.water').show().removeClass('disabled');
            this.$('.spill').show().removeClass('disabled');
            this.$('.beached').show().removeClass('disabled');
        },

        showAllObjects: function(){
            this.$('.object').show().removeClass('disabled');
            this.$('.beached').hide().addClass('disabled');
        },

        showTrajectoryObjects: function(){
            this.$('.model-objects > div').hide().addClass('disabled');
            this.$('.wind').show().removeClass('disabled');
            this.$('.spill').show().removeClass('disabled');
            this.$('.map.object').show().removeClass('disabled');
            this.$('.current').show().removeClass('disabled');
            this.$('.beached').hide().addClass('disabled');
        },

        updateObjects: function(){
            var delay = {
                show: 500,
                hide: 100
            };

            if(webgnome.model.get('map').get('obj_type').indexOf('ParamMap') !== -1){
                this.$('.map.object .add').show();
            } else {
                this.$('.map.object .add').hide();
            }

            $('.panel-heading .add').tooltip({
                title: function(){
                    var object = $(this).parents('.panel-heading').text().trim();

                    if($(this).parents('.panel').hasClass('complete') && $(this).parents('.spill').length === 0){
                        return 'Edit ' + object;
                    } else {
                        return 'Create ' + object;
                    }
                },
                delay: delay,
                container: 'body'
            });

            $('.panel-heading .state').tooltip({
                title: function(){
                    var object = $(this).parents('.panel-heading').text().trim();

                    if($(this).parents('.panel').hasClass('complete')){
                        return object + ' requirement met';
                    } else if($(this).parents('.panel').hasClass('optional')){
                        return object + ' optional';
                    } else {
                        return object + ' required';
                    }
                },
                container: 'body',
                delay: delay
            });

            $('.spill .trash, .spill .edit').tooltip({
                container: 'body',
                delay: delay
            });

            if(this.$('.stage-2 .panel:visible').length === this.$('.stage-2 .panel.complete:visible').length){
                this.$('.stage-3').show();
                this.updateResponse();
                if(this.$('.beached.object:visible').length > 0){
                    this.updateBeached();
                }
                if(webgnome.cache.length > 0){
                    this.$('.stage-4').show();
                }
            } else {
                this.$('.stage-3').hide();
            }
            this.renderTimeline();
            this.mason.layout();
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(_.isUndefined(wind) || wind.length === 0){
                wind = new WindModel();
            }

            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);
            windForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(wind, {merge:true});
                this.updateWind();
                this.renderTimeline();
            }, this));
            windForm.render();
        },

        // TODO: Change it so that we don't have to use a hard-coded value for the 
        // max uncertainty value
        windSpeedParse: function(wind){
            var uncertainty = wind.get('speed_uncertainty_scale');
            var speed = wind.get('timeseries')[0][1][0];

            var ranger = nucos.rayleighDist().rangeFinder(speed, uncertainty);
            return (ranger.low.toFixed(1) + ' - ' + ranger.high.toFixed(1));
        },

        updateWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!_.isUndefined(wind)){
                var compiled, dataset;
                this.$('.wind .panel').addClass('complete');
                if(wind.get('timeseries').length === 1){
                    var windSpeed;
                    if (wind.get('speed_uncertainty_scale') === 0) {
                        windSpeed = wind.get('timeseries')[0][1][0];
                    } else {
                        windSpeed = this.windSpeedParse(wind);
                    }
                    compiled = _.template(WindPanelTemplate, {
                        speed: windSpeed,
                        direction: wind.get('timeseries')[0][1][1],
                        units: wind.get('units')
                    });
                    this.$('.wind').removeClass('col-md-6').addClass('col-md-3');
                } else {
                    compiled = '<div class="chart"><div class="axisLabel yaxisLabel">' + wind.get('units') + '</div><div class="axisLabel xaxisLabel">Time</div><div class="canvas"></div></div>';
                    var ts = wind.get('timeseries');
                    var data = [];
                    var raw_data = [];
                    var rate = Math.round(ts.length / 24);
                    
                    for (var entry in ts){
                        var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                        if(rate === 0 ||  entry % rate === 0){
                            data.push([parseInt(date, 10), parseFloat(ts[entry][1][0]), parseInt(ts[entry][1][1], 10) - 180]);
                        }
                        raw_data.push([parseInt(date, 10), parseFloat(ts[entry][1][0]), parseInt(ts[entry][1][1], 10) - 180]);
                    }

                    dataset = [{
                        data: data,
                        color: 'rgba(151,187,205,1)',
                        hoverable: true,
                        shadowSize: 0,
                        lines: {
                            show: false,
                            lineWidth: 2
                        },
                        direction: {
                            show: true,
                            openAngle: 40,
                            color: '#7a7a7a',
                            fillColor: '#7a7a7a',
                            arrawLength: 5
                        }
                    }];

                    if (ts.length > 24){
                        dataset.push({
                            data: raw_data,
                            color: 'rgba(151,187,205,1)',
                            hoverable: true,
                            shadowSize: 0,
                            lines: {
                                show: true,
                                lineWidth: 2
                            },
                            direction: {
                                show: false
                            }
                        });
                    }

                    this.$('.wind').removeClass('col-md-3').addClass('col-md-6');
                }
                this.$('.wind .panel-body').html(compiled);
                this.$('.wind .panel-body').show();

                if(dataset){
                    // set a time out to wait for the box to finish expanding or animating before drawing
                    setTimeout(_.bind(function(){
                        this.windPlot = $.plot('.wind .chart .canvas', dataset, {
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
                                tickColor: '#ddd'
                            }
                        });
                    }, this), 2);
                }
                this.mason.layout();
            } else {
                this.$('.wind').removeClass('col-md-6').addClass('col-md-3');
                this.$('.wind .panel').removeClass('complete');
                this.$('.wind .panel-body').hide().html('');
            }
        },

        clickWater: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            if(_.isUndefined(water) || water.length === 0){
                water = new WaterModel();
            }
            var waterForm = new WaterForm(null, water);
            waterForm.on('hidden', waterForm.close);
            waterForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(water, {merge:true});
                this.updateWater();
            }, this));
            waterForm.render();
        },

        updateWater: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            if (!_.isUndefined(water)){
                var compiled;
                this.$('.water .panel').addClass('complete');
                compiled = _.template(WaterPanelTemplate, {
                    temperature: water.get('temperature'),
                    salinity: water.get('salinity'),
                    sediment: water.get('sediment'),
                    wave_height: water.get('wave_height'),
                    fetch: water.get('fetch'),
                    units: water.get('units')
                });
                this.$('.water .panel-body').html(compiled);
                this.$('.water .panel-body').show();
            } else {
                this.$('.water .panel').removeClass('complete');
                this.$('.water .panel-body').hide().html('');
            }
        },

        clickSpill: function(){
            var spillTypeForm = new SpillTypeForm();
            spillTypeForm.render();
            spillTypeForm.on('hidden', spillTypeForm.close);
        },

        loadSpill: function(e){
            e.stopPropagation();
            var spillId = $(e.target).parents('.single').data('id');
            var spill = webgnome.model.get('spills').get(spillId);
            var spillView;
            if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                spillView = new SpillContinueView(null, spill);
            } else {
                spillView = new SpillInstantView(null, spill);
            }
            spillView.on('save wizardclose', _.bind(function(){
                this.updateSpill();
                this.renderTimeline();
            }, this));
            spillView.on('save', function(){
                spillView.on('hidden', spillView.close);
            });
            spillView.on('wizardclose', spillView.close);

            spillView.render();
        },

        renderOilLibrary: function() {
            var element_type = webgnome.model.get('spills').at(0).get('element_type');
            var oilLib = new OilLibraryView({}, element_type);
            oilLib.on('save wizardclose', _.bind(function(){
                this.updateSpill();
                webgnome.model.save();
                oilLib.on('hidden', oilLib.close);
            }, this));
            oilLib.render();
        },

        calculateSpillAmount: function(){
            var oilAPI;
            var oilconvert = new nucos.OilQuantityConverter();
            var spills = webgnome.model.get('spills');
            if (spills.length > 0 && spills.at(0).get('element_type').get('substance')){
                oilAPI = spills.at(0).get('element_type').get('substance').api;
            }
            oilAPI = oilAPI ? oilAPI : 10;
            var units = spills.models.length ? spills.at(0).get('units') : '';
            var timeStep = webgnome.model.get('time_step');
            var numOfTimeSteps = webgnome.model.get('num_time_steps');
            var start_time = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss');
            var data = {};
            for (var j = 0; j < spills.models.length; j++){
                var releaseTime = moment(spills.models[j].get('release').get('release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                var endReleaseTime = moment(spills.models[j].get('release').get('end_release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                var timeDiff = endReleaseTime - releaseTime;
                var spillUnits = spills.models[j].get('units');
                var amount = 0;
                var amountArray = [];
                for (var i = 0; i < numOfTimeSteps; i++){
                    var upperBound = moment(start_time).add(i * timeStep, 's').unix();
                    var lowerBound = upperBound - timeStep;
                    if (releaseTime >= lowerBound && endReleaseTime < upperBound && timeDiff <= timeStep && i < numOfTimeSteps){
                        amount += spills.models[j].get('amount');
                    } else if (timeDiff > timeStep) {
                        var rateOfRelease = spills.models[j].get('amount') / timeDiff;
                        if (releaseTime >= lowerBound && endReleaseTime >= upperBound && releaseTime <= upperBound){
                            var head = (upperBound - releaseTime);
                            amount += rateOfRelease * head;
                        } else if (releaseTime <= lowerBound && endReleaseTime >= upperBound){
                            amount += rateOfRelease * timeStep;
                        } else if (releaseTime <= lowerBound && endReleaseTime <= upperBound && endReleaseTime >= lowerBound){
                            var tail = endReleaseTime - lowerBound;
                            amount += rateOfRelease * tail;
                        }
                    }
                    amountArray.push(amount);
                }
                for (var o = 0; o < amountArray.length; o++){
                    amountArray[o] = oilconvert.Convert(amountArray[o], spillUnits, oilAPI, "API degree", units);
                }
                data[j] = amountArray;
            }
            return data;
        },

        updateSpill: function(){
            var spills = webgnome.model.get('spills');
            spills.forEach(function(spill){
                spill.isValid();
            });
            var spillArray = this.calculateSpillAmount();
            var compiled;

            var numOfTimeSteps = webgnome.model.get('num_time_steps');
            var timeStep = webgnome.model.get('time_step');

            if(spills.models.length > 0){
                this.$('.spill .panel').addClass('complete');
                var substance = spills.at(0).get('element_type').get('substance');
                if (!_.isNull(substance)){
                    compiled = _.template(SpillPanelTemplate, {
                        spills: spills.models,
                        substance: substance,
                        categories: substance.parseCategories(),
                    });
                } else {
                    compiled = _.template(SpillPanelTemplate, {
                        spills: spills.models,
                        substance: false,
                        categories: [],
                    });
                }

                var dataset = [];
                for (var spill in spills.models){
                    if (!_.isNull(spills.models[spill].validationError)){ continue; }
                    var data = [];
                    var start_time = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss');
                    for (var i = 0; i < numOfTimeSteps; i++){
                        var date = start_time.add(timeStep, 's').unix() * 1000;
                        var amount = spillArray[spill][i];
                        data.push([parseInt(date, 10), parseInt(amount, 10)]);
                    }

                    dataset.push({
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
                        id: spills.models[spill].get('id')
                    });
                }

                this.$('.spill').removeClass('col-md-3').addClass('col-md-6');
                this.$('.spill .panel-body').html(compiled);
                this.$('.spill .panel-body').show();

                if(!_.isUndefined(dataset)){
                    this.spillDataset = dataset;
                    setTimeout(_.bind(function(){
                        this.renderSpillRelease(dataset);
                    }, this), 1);
                }
                
            } else {
                this.$('.spill .panel').removeClass('complete');
                this.$('.spill .panel-body').hide().html('');
                this.$('.spill').removeClass('col-md-6').addClass('col-md-3');
            }
            this.mason.layout();
        },

        renderSpillRelease: function(dataset){
            this.spillPlot = $.plot('.spill .chart .canvas', dataset, {
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    hoverable: true
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    tickColor: '#ddd'
                },
                yaxis: {
                    tickColor: '#ddd'
                },
                tooltip: false,
                tooltipOpts: {
                    content: function(label, x, y, flotItem){ return "Time: " + moment(x).calendar() + "<br>Amount: " + y ;}
                },
                shifts: {
                    x: -30,
                    y: -50
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
                },
                needle: false
            });
        },

        hoverSpill: function(e){
            if ($(e.target).attr('id') !== 'substanceInfo'){
                var id = $(e.target).data('id');
                if (_.isUndefined(id)){
                    id = $(e.target).parents('.single').data('id');
                }
                var coloredSet = [];
                for(var dataset in this.spillDataset){
                    var ds = _.clone(this.spillDataset[dataset]);
                    if (this.spillDataset[dataset].id !== id){
                        ds.color = '#ddd';
                    }

                    coloredSet.push(ds);
                }
                this.spillPlot.setData(coloredSet);
                this.spillPlot.draw();
            }
        },

        unhoverSpill: function(){
            this.spillPlot.setData(this.spillDataset);
            this.spillPlot.draw();
        },

        deleteSpill: function(e){
            e.stopPropagation();
            var id = $(e.target).parents('.single').data('id');
            var spill = webgnome.model.get('spills').get(id);
            swal({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this spill?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }, _.bind(function(isConfirmed){
                if(isConfirmed){
                    webgnome.model.get('spills').remove(id);
                    webgnome.model.save(null, {
                        success: _.bind(function(){
                            this.updateSpill();
                        }, this),
                        validate: false
                    });
                }
            }, this));
        },

        clickLocation: function(){
            var locationForm = new LocationForm();
            locationForm.on('loaded', _.bind(function(){
                locationForm.hide();
                this.updateLocation();
                this.updateCurrent();
                this.updateSpill();
                this.updateModelValues();
            }, this));
            locationForm.render();
        },

        updateLocation: function(){
            var map = webgnome.model.get('map');
            if(map && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                this.$('.map .panel').addClass('complete');
                map.getGeoJSON(_.bind(function(geojson){
                    this.$('.map .panel-body').removeClass('text');
                    this.$('.map .panel-body').addClass('map').show().html('<div class="map" id="mini-locmap"></div>');

                    var shorelineSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                    });

                    var shorelineLayer = new ol.layer.Image({
                        name: 'modelmap',
                        source: new ol.source.ImageVector({
                            source: shorelineSource,
                            style: new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: [228, 195, 140, 0.6]
                                }),
                                stroke: new ol.style.Stroke({
                                    color: [228, 195, 140, 0.75],
                                    width: 1
                                })
                            })
                        }),
                    });
                    
                    var locationMap = new OlMapView({
                        id: 'mini-locmap',
                        controls: [],
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'osm'}),
                                visible: webgnome.model.get('map').geographical
                            }),
                            shorelineLayer
                        ],
                        interactions: ol.interaction.defaults({
                            mouseWheelZoom: false,
                            dragPan: false
                        }),
                    });
                    
                    locationMap.render();
                    var extent = shorelineSource.getExtent();
                    locationMap.map.getView().fit(extent, locationMap.map.getSize());
                    this.mason.layout();
                }, this));
            } else {
                this.$('.map .panel').addClass('complete');
                this.$('.map .panel-body').addClass('text').show().html('<div><label>Type:</label> Infinite Ocean</div>');
                this.$('.map .panel-body').removeClass('map');
                this.mason.layout();
            }
        },

        updateCurrent: function(){
            // for right now only visualize cats mover grids
            var currents = webgnome.model.get('movers').filter(function(mover){
                return ['gnome.movers.current_movers.CatsMover', 'gnome.movers.current_movers.GridCurrentMover'].indexOf(mover.get('obj_type')) !== -1;
            });

            if(currents.length > 0){
                this.$('.current .panel-body').show().html('<div class="map" id="mini-currentmap"></div>');
                this.current_layers = new ol.Collection([
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    })
                ]);

                var currentMap = new OlMapView({
                    id: 'mini-currentmap',
                    controls: [],
                    layers: this.current_layers,
                    interactions: ol.interaction.defaults({
                        mouseWheelZoom: false,
                        dragPan: false
                    }),
                });
                currentMap.render();

                this.current_extents = [];
                for(var c = 0; c < currents.length; c++){
                    currents[c].getGrid(_.bind(this.addCurrentToPanel, this));
                }
                if(webgnome.model.get('map')){
                    var extent = ol.extent.applyTransform(webgnome.model.get('map').getExtent(), ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
                    currentMap.map.getView().fit(extent, currentMap.map.getSize());
                }
                this.mason.layout();
            } else {
                this.current_extents = [];
                this.$('.current .panel-body').hide().html('');
            }
        },

        addCurrentToPanel: function(geojson){
            if(geojson){
                var gridSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                });
                var extentSum = gridSource.getExtent().reduce(function(prev, cur){ return prev + cur;});

                var gridLayer = new ol.layer.Image({
                    name: 'modelcurrent',
                    source: new ol.source.ImageVector({
                        source: gridSource,
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [171, 37, 184, 0.75],
                                width: 1
                            })
                        })
                    })
                });

                if(!_.contains(this.current_extents, extentSum)){
                    this.current_layers.push(gridLayer);
                    this.current_extents.push(extentSum);
                }
            }
        },

        clickMap: function(){
            var mapForm = new MapTypeForm();
            mapForm.on('hidden', mapForm.close);
            // mapForm.on('realLocation', _.bind(function(){
            //     var location = new LocationForm();
            //     location.on('loaded', _.bind(function(){
            //         this.updateLocation();
            //         this.updateCurrent();
            //         this.mason.layout();
            //     }, this));
            //     location.render();
            // }, this));
            mapForm.on('waterWorld', _.bind(function(){
                webgnome.model.resetLocation(_.bind(function(){
                    this.updateLocation();
                    this.updateCurrent();
                    this.$('.map.object .add').hide();
                    mapForm.hide();
                }, this));
            }, this));
            mapForm.on('select', _.bind(function(form){
                mapForm.on('hidden', _.bind(function(){
                    form.render();
                    form.on('hidden', form.close);
                    form.on('save', _.bind(function(map){
                        webgnome.model.set('map', map);
                        webgnome.model.save();
                        this.updateLocation();
                        if(map.get('obj_type').indexOf('ParamMap') !== -1){
                            this.$('.object.map .add').show();
                        } else {
                            this.$('.object.map .add').hide();
                        }
                    }, this));
                }, this));
            }, this));
            mapForm.render();
        },

        editMap: function(){
            // only able to "edit" param right now and even behind the scenes it just
            // creates a new map object anyway.
            var map = webgnome.model.get('map');
            var form = new ParamMapForm({map: map});
            form.render();
            form.on('hidden', form.close);
            form.on('save', _.bind(function(map){
                webgnome.model.set('map', map);
                webgnome.model.save();
            }, this));
            form.on('save', this.updateLocation, this);
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
            responseView.on('wizardclose', function(){
                responseView.on('hidden', responseView.close);
            });
            responseView.on('save', _.bind(function(){
                webgnome.model.save(null, {validate: false});
                setTimeout(_.bind(function(){
                    responseView.close();
                    this.updateResponse();
                }, this), 750);
            }, this));
            responseView.render();
        },

        deleteResponse: function(e){
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
                    webgnome.model.save({
                        success: _.bind(function(){
                            this.updateResponse();
                        }, this),
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