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
    'model/map',
    'views/form/map',
    'text!templates/panel/map.html',
    'model/environment/water',
    'views/form/water',
    'text!templates/panel/water.html',
    'model/spill',
    'views/form/spill/type',
    'text!templates/panel/spill.html',
    'views/form/spill/continue',
    'views/form/spill/instant',
    'views/form/location',
    'views/default/map',
    'views/form/response/type',
    'text!templates/panel/response.html',
    'views/form/response/disperse',
    'views/form/response/insituBurn',
    'views/form/response/skim',
    'model/outputters/geojson',
    'model/outputters/weathering',
    'model/weatherers/evaporation',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection',
    'flottooltip',
    'flotstack',
    'flotgantt'
], function($, _, Backbone, BaseView, module, moment, ol, Masonry, swal, nucos, AdiosSetupTemplate, GnomeModel,
    WindModel, WindMoverModel, WindForm, WindPanelTemplate,
    MapModel, MapForm, MapPanelTemplate,
    WaterModel, WaterForm, WaterPanelTemplate,
    SpillModel, SpillTypeForm, SpillPanelTemplate, SpillContinueView, SpillInstantView,
    LocationForm, olMapView, ResponseTypeForm, ResponsePanelTemplate, ResponseDisperseView, ResponseBurnView, ResponseSkimView,
    GeojsonOutputter, WeatheringOutputter, EvaporationModel){
    var adiosSetupView = BaseView.extend({
        className: 'page setup',

        events: function(){
            return _.defaults({
                'click .icon': 'selectPrediction',
                'click .wind .add': 'clickWind',
                'click .water .add': 'clickWater',
                'click .spill .add': 'clickSpill',
                'click .spill .single .edit': 'loadSpill',
                'click .spill .single .trash': 'deleteSpill',
                'mouseover .spill .single': 'hoverSpill',
                'mouseout .spill .spill-list': 'unhoverSpill',
                'click .location .add': 'clickLocation',
                'click .response .add': 'clickResponse',
                'click .response .single .edit': 'loadResponse',
                'click .response .single .trash': 'deleteResponse',
                'mouseover .response .single': 'hoverResponse',
                'mouseout .response .response-list': 'unhoverResponse',
                'blur input': 'updateModel',
                'click .eval': 'evalModel',
            }, BaseView.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            $('body').append(this.$el);
            if(webgnome.hasModel()){
                this.render();
            } else {
                webgnome.model = new GnomeModel();
                webgnome.model.setup(_.bind(function(){
                    this.render();
                }, this));
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
            this.initMason();

            setTimeout(_.bind(function(){
                var pred = localStorage.getItem('prediction');
                if(pred){
                    this.$('.' + pred).click();
                } else {
                    this.$('.fate').click();
                }
                webgnome.model.on('sync', this.updateObjects, this);
            }, this), 1);

            this.$('.datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('.datetime').datetimepicker('show');
            }, this));
        },

        showHelp: function(){
            var compiled = '<div class="gnome-help" title="Click for help"></div>';
            this.$('h2:first').append(compiled);
            this.$('h2:first .gnome-help').tooltip();
        },

        clickDate: function(){
            this.$('.datetime').trigger('click');
            console.log("calendar clicked");
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
            webgnome.router.navigate('model', true);
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

            webgnome.model.save();
        },

        selectPrediction: function(e){
            var target;
            if(this.$(e.target).hasClass('icon')){
                target = this.$(e.target).attr('class').replace('icon', '').replace('selected', '').trim();
            } else {
                target = this.$(e.target).parent().attr('class').replace('icon', '').replace('selected', '').trim();
            }

            this.configureWeatherers(target);

            if (target == 'fate' && webgnome.model.get('map').get('obj_type') != 'gnome.map.GnomeMap'){
                swal({
                    title: 'Warning!',
                    type: 'warning',
                    text: 'Switching to a fate only model will remove any geospatial objects (map, currents, etc...).',
                    showCancelButton: true,
                    confirmButtonText: 'Switch to fate only modeling'
                }, _.bind(function(isConfirmed){
                    if(isConfirmed){
                        webgnome.model.resetLocation();
                        webgnome.model.on('reset:location', webgnome.model.save);
                        this.togglePrediction(e, target);
                    }
                }, this));
            } else {
                this.togglePrediction(e, target);
            }
            this.$('.stage-2').show();
        },

        togglePrediction: function(e, target){
            this.$('.icon').removeClass('selected');

            if(this.$(e.target).hasClass('icon')){
                this.$(e.target).addClass('selected');
            } else {
                this.$(e.target).parent().addClass('selected');
            }

            localStorage.setItem('prediction', target);

            if (target == 'fate') {
                this.showFateObjects();
            } else if (target == 'trajectory') {
                this.showTrajectoryObjects();
            } else{
                this.showAllObjects();
            }

            setTimeout(_.bind(function(){
                this.updateObjects();
            }, this), 1);
        },

        showFateObjects: function(){
            this.$('.model-objects > div').hide().addClass('disabled');
            this.$('.wind').show().removeClass('disabled');
            this.$('.water').show().removeClass('disabled');
            this.$('.spill').show().removeClass('disabled');
        },

        showAllObjects: function(){
            this.$('.object').show().removeClass('disabled');
        },

        showTrajectoryObjects: function(){
            this.$('.model-objects > div').hide().addClass('disabled');
            this.$('.wind').show().removeClass('disabled');
            this.$('.spill').show().removeClass('disabled');
            this.$('.location').show().removeClass('disabled');
        },

        updateObjects: function(){
            this.constructModelTimeSeries(_.bind(function(){
                this.updateWind();
                this.updateLocation();
                this.updateWater();
                this.updateSpill();
                

                var delay = {
                    show: 500,
                    hide: 100
                };

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
                if(this.$('.stage-2 .panel:visible').length == this.$('.stage-2 .panel.complete:visible').length && localStorage.getItem('prediction') !== 'null'){
                    this.$('.stage-3').show();
                    this.updateResponse();
                } else {
                    this.$('.stage-3').hide();
                }
                this.mason.layout();
            }, this));
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(_.isUndefined(wind) || wind.length === 0){
                wind = new WindModel();
            }

            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);
            windForm.on('save', function(){
                webgnome.model.get('environment').add(wind);
                var evaporation = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'});
                evaporation.set('wind', wind);
                evaporation.save();
                var mover = webgnome.model.get('movers').findWhere({obj_type: 'gnome.movers.wind_movers.WindMover'});
                if(_.isUndefined(mover) || mover.get('wind').get('id') != wind.get('id')){
                    var windMover = new WindMoverModel({wind: wind});
                    windMover.save(null, {
                        validate: false,
                        success: function(){
                            webgnome.model.get('movers').add(windMover);
                            webgnome.model.save();
                        }
                    });
                } else {
                    webgnome.model.save();
                }
            });
            windForm.render();
        },

        // TODO: Change it so that we don't have to use a hard-coded value for the 
        // max uncertainty value
        windSpeedParse: function(wind){
            var uncertainty = wind.get('speed_uncertainty_scale') * 5;
            var speed = wind.get('timeseries')[0][1][0];

            var bottom = parseInt(speed, 10) - parseInt(uncertainty, 10);
            if (bottom < 0){
                bottom = 0;
            }
            var top = parseInt(speed, 10) + parseInt(uncertainty, 10);
            return (bottom + ' - ' + top);
        },

        updateWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!_.isUndefined(wind)){
                var compiled;
                this.$('.wind .panel').addClass('complete');
                if(wind.get('timeseries').length == 1){
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
                    compiled = '<div class="chart"><div class="axisLabel yaxisLabel">' + wind.get('units') + '</div><div class="axisLabel xaxisLabel">Timeline (24 hrs)</div><div class="canvas"></div></div>';
                    var ts = wind.get('timeseries');
                    var data = [];

                    for (var entry in ts){
                        var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                        data.push([parseInt(date, 10), parseInt(ts[entry][1][0], 10), parseInt(ts[entry][1][1], 10) - 180]);
                    }

                    var dataset = [{
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

                    this.$('.wind').removeClass('col-md-3').addClass('col-md-6');
                }
                this.$('.wind .panel-body').html(compiled);
                this.$('.wind .panel-body').show();

                if(!_.isUndefined(dataset)){
                    // set a time out to wait for the box to finish expanding or animating before drawing
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
                }
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
            waterForm.on('save', function(){
                webgnome.model.get('environment').add(water);
                var evaporation = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'});
                evaporation.set('water', water);
                evaporation.save(null, {
                    success: function(){
                        webgnome.model.save();
                    }
                });
            });
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
            var spillId = $(e.target).parents('.single').data('id');
            var spill = webgnome.model.get('spills').get(spillId);
            var spillView;
            if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                spillView = new SpillContinueView(null, spill);
            } else {
                spillView = new SpillInstantView(null, spill);
            }
            spillView.on('wizardclose', function(){
                spillView.on('hidden', spillView.close);
            });
            spillView.on('save', function(){
                webgnome.model.trigger('sync');
                setTimeout(_.bind(function(){
                    spillView.close();},
                this), 750);
            });
            spillView.render();
        },

        constructModelTimeSeries: function(cb){
            var start_time = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
            var numOfTimeSteps = webgnome.model.get('num_time_steps');
            var timeStep = webgnome.model.get('time_step');
            var timeSeries = [];

            for (var i = 0; i < numOfTimeSteps; i++){
                if (i === 0){
                    timeSeries.push(start_time * 1000);
                } else {
                    var answer = moment(timeSeries[i - 1]).add(timeStep, 's').unix() * 1000;
                    timeSeries.push(answer);
                }
            }

            this.timeSeries = timeSeries;
            
            if (cb){
                cb();
            }
        },

        calculateSpillAmount: function(timeseries){
            var oilconvert = new nucos.OilQuantityConverter();
            var spills = webgnome.model.get('spills');
            if (spills.length > 0){
                var oilAPI = spills.at(0).get('element_type').get('substance').api;
                oilAPI = oilAPI ? oilAPI : 10;
            }
            var units = spills.models.length ? spills.at(0).get('units') : '';
            var timeStep = webgnome.model.get('time_step');
            var data = {};
            for (var j = 0; j < spills.models.length; j++){
                var releaseTime = moment(spills.models[j].get('release').get('release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                var endReleaseTime = moment(spills.models[j].get('release').get('end_release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                var timeDiff = endReleaseTime - releaseTime;
                var spillUnits = spills.models[j].get('units');
                var amount = 0;
                var amountArray = [];
                for (var i = 1; i < timeseries.length + 1; i++){
                    var upperBound = moment(timeseries[i]).unix();
                    var lowerBound = upperBound - timeStep;
                    if (releaseTime >= lowerBound && endReleaseTime < upperBound && timeDiff <= timeStep && i !== timeseries.length){
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
                for (var i = 0; i < amountArray.length; i++){
                    amountArray[i] = oilconvert.Convert(amountArray[i], spillUnits, oilAPI, "API degree", units);
                }
                data[j] = amountArray;
            }
            return data;
        },

        updateSpill: function(){
            var spills = webgnome.model.get('spills');
            var timeSeries = this.timeSeries;
            var spillArray = this.calculateSpillAmount(timeSeries);
            if(spills.models.length > 0){
                this.$('.spill .panel').addClass('complete');
                var compiled = _.template(SpillPanelTemplate, {spills: spills.models});

                var dataset = [];
                for (var spill in spills.models){
                    var data = [];
                    for (var i = 0; i < timeSeries.length; i++){
                        var date = timeSeries[i];
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
                    this.renderSpillRelease(dataset);
                }
                
            } else {
                this.$('.spill .panel').removeClass('complete');
                this.$('.spill .panel-body').hide().html('');
                this.$('.spill').removeClass('col-md-6').addClass('col-md-3');
            }
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
                }
            });
        },

        hoverSpill: function(e){
            var id = $(e.target).data('id');
            if (_.isUndefined(id)){
                id = $(e.target).parents('.single').data('id');
            }
            var coloredSet = [];
            for(var dataset in this.spillDataset){
                var ds = _.clone(this.spillDataset[dataset]);
                if (this.spillDataset[dataset].id != id){
                    ds.color = '#ddd';
                }

                coloredSet.push(ds);
            }
            this.spillPlot.setData(coloredSet);
            this.spillPlot.draw();
        },

        unhoverSpill: function(){
            this.spillPlot.setData(this.spillDataset);
            this.spillPlot.draw();
        },

        deleteSpill: function(e){
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
                    webgnome.model.save({
                        success: _.bind(function(){
                            this.updateSpill();
                        }, this)
                    });
                }
            }, this));
        },

        clickLocation: function(){
            var locationForm = new LocationForm();
            locationForm.on('loaded', _.bind(function(){
                locationForm.hide();
                this.updateObjects();
                this.configureWeatherers(this.$('.icon.selected').attr('class').replace('icon', '').replace('selected', '').trim());
                webgnome.model.on('sync', this.updateObjects, this);
            }, this));
            locationForm.render();
            webgnome.model.off('sync', this.updateObjects, this);
        },

        updateLocation: function(){
            var map = webgnome.model.get('map');
            if(map && map.get('obj_type') != 'gnome.map.GnomeMap'){
                this.$('.location .panel').addClass('complete');
                map.getGeoJSON(_.bind(function(geojson){
                    this.$('.location .panel-body').show().html('<div class="map" id="mini-locmap"></div>');

                    var shorelineSource = new ol.source.GeoJSON({
                        projection: 'EPSG:3857',
                        object: geojson
                    });

                    var shorelineLayer = new ol.layer.Vector({
                        name: 'modelmap',
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
                    });
                    var locationMap = new olMapView({
                        id: 'mini-locmap',
                        controls: [],
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'osm'})
                            }),
                            shorelineLayer
                        ]
                    });
                    
                    locationMap.render();
                    var extent = shorelineSource.getExtent();
                    locationMap.map.getView().fitExtent(extent, locationMap.map.getSize());
                    this.mason.layout();
                }, this));
            } else {
                this.$('.location .panel').removeClass('complete');
                this.$('.location .panel-body').hide().html('');
            }
        },

        clickResponse: function(){
            var typeForm = new ResponseTypeForm();
            typeForm.render();
        },

        updateResponse: function(weatherers){
            if (_.isUndefined(weatherers)){
                var weatherers = webgnome.model.get('weatherers').models;
            }
            var timeSeries = this.timeSeries;
            var filteredNames = ["_natural", "Evaporation", "Weatherer"];
            this.responses = [];
            for (var i = 0; i < weatherers.length; i++){
                if (filteredNames.indexOf(weatherers[i].attributes.name) === -1){
                    this.responses.push(weatherers[i]);
                }
            }
            if (this.responses.length > 0){
                this.$('.response .panel').addClass('complete');
                var compiled = _.template(ResponsePanelTemplate, {responses: this.responses});

                this.$('.response').removeClass('col-md-3').addClass('col-md-6');
                this.$('.response .panel-body').html(compiled);
                this.$('.response .panel-body').show();

                this.graphDraw(this.responses);

            } else {
                this.$('.response .panel').removeClass('complete');
                this.$('.response .panel-body').hide().html('');
                this.$('.response').removeClass('col-md-6').addClass('col-md-3');
            }   
        },

        graphDraw: function(responses){
            var burnData = [];
            var skimData = [];
            var disperseData = [];
            var yticks = [[1, "Skim"], [2, "Dispersion"], [3, "Burn"]];
            for (i in responses){
                var responseObjType = responses[i].get('obj_type').split(".");
                var startTime = responses[i].get('active_start') !== '-inf' ? moment(responses[i].get('active_start')).unix() * 1000 : moment(webgnome.model.get('start_time')).unix() * 1000;
                var endTime = responses[i].get('active_stop') !== 'inf' ? moment(responses[i].get('active_stop')).unix() * 1000 : moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's').unix() * 1000;
                switch (responseObjType[responseObjType.length - 1]){
                    case "Skimmer":
                        skimData.push([startTime, 1, endTime, responses[i].get('id')]);
                        break;
                    case "Dispersion":
                        disperseData.push([startTime, 2, endTime, responses[i].get('id')]);
                        break;
                    case "Burn":
                        burnData.push([startTime, 3, endTime, responses[i].get('id')]);
                }
            }

            var dataset = [
                {
                    //label: "Burns",
                    data: burnData,
                    direction: {
                        show: false
                    }
                },
                {
                    //label: "Skim",
                    data: skimData,
                    direction: {
                        show: false
                    }
                },
                {
                    //label: "Dispersion",
                    data: disperseData,
                    direction: {
                        show: false
                    }
                }
            ];

            if(!_.isUndefined(dataset)){
                this.responseDataset = dataset;
                this.renderResponseGraph(dataset, yticks);
            }

        },

        renderResponseGraph: function(dataset, yticks){
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
                    min: this.timeSeries[0],
                    max: this.timeSeries[this.timeSeries.length - 1]
                },
                yaxis: {
                    min: 0.5,
                    max: yticks.length + 0.5,
                    ticks: yticks
                }

            });
        },

        hoverResponse: function(e){
            var id = $(e.target).data('id');
            if (_.isUndefined(id)){
                id = $(e.target).parents('.single').data('id');
            }
            this.graphDraw([webgnome.model.get('weatherers').get(id)]);
        },

        unhoverResponse: function(){
            this.graphDraw(this.responses);
        },

        loadResponse: function(e){
            var responseId = $(e.target).parents('.single').data('id');
            var response = webgnome.model.get('weatherers').get(responseId);
            var responseView;
            var nameArray = response.get('obj_type').split('.');
            switch (nameArray[nameArray.length - 1]){
                case "Dispersion":
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
            responseView.on('save', function(){
                webgnome.model.trigger('sync');
                setTimeout(_.bind(function(){
                    responseView.close();},
                this), 750);
            });
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
                        }, this)
                    });
                }
            }, this));
        },
        
        configureWeatherers: function(prediction){
            if (prediction == 'fate' || prediction == 'both'){
                // turn on weatherers
                webgnome.model.get('weatherers').forEach(function(weatherer, index, list){
                    weatherer.set('on', true);
                    weatherer.save();
                });
            } else if (prediction == 'trajectory') {
                // turn off weatherers
                webgnome.model.get('weatherers').forEach(function(weatherer, index, list){
                    weatherer.set('on', false);
                    weatherer.save();
                });
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
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});