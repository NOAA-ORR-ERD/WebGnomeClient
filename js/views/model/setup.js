define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'ol',
    'masonry',
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
    'text!templates/panel/spills.html',
    'views/form/spill/continue',
    'views/form/spill/instant',
    'views/form/location',
    'views/default/map',
    'model/outputters/geojson',
    'model/outputters/weathering',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection',
    'flottooltip'
], function($, _, Backbone, moment, ol, Masonry, AdiosSetupTemplate, GnomeModel,
    WindModel, WindMoverModel, WindForm, WindPanelTemplate,
    MapModel, MapForm, MapPanelTemplate,
    WaterModel, WaterForm, WaterPanelTemplate,
    SpillModel, SpillTypeForm, SpillPanelTemplate, SpillContinueView, SpillInstantView,
    LocationForm, olMapView, GeojsonOutputter, WeatheringOutputter){
    var adiosSetupView = Backbone.View.extend({
        className: 'page setup',

        events: {
            'click .icon': 'selectPrediction',
            'click .wind': 'clickWind',
            'click .water': 'clickWater',
            'click .plus-sign': 'clickSpill',
            'click .spill-single': 'loadSpill',
            'click .trash': 'deleteSpill',
            'click .map': 'clickMap',
            'click .location': 'clickLocation',
            'click .response': 'clickResponse',
            'blur input': 'updateModel',
            'click .eval': 'evalModel'
        },

        initialize: function(){
            if(webgnome.hasModel()){
                webgnome.model.on('sync', this.updateObjects, this);
                this.render();
            } else {
                webgnome.model = new GnomeModel();
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        var gout = new GeojsonOutputter();
                        gout.save(null, {
                            validate: false,
                            success: _.bind(function(){
                                webgnome.model.get('outputters').add(gout);
                                var wout = new WeatheringOutputter();
                                wout.save(null, {
                                    validate: false,
                                    success: _.bind(function(){
                                        webgnome.model.get('outputters').add(wout);
                                        webgnome.model.save(null, {
                                            validate: false,
                                            success: _.bind(function(model, response, options){
                                                webgnome.model.on('sync', this.updateObjects, this);
                                                this.render();
                                            }, this)
                                        });
                                    }, this)
                                });
                            }, this)
                        });
                    }, this)
                });
            }
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate, {
                start_time: moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: webgnome.model.formatDuration(),
            });

            $('body').append(this.$el.append(compiled));

            var container = this.$('.model-objects').get(0);
            this.mason = new Masonry(container, {
                columnWidth: '.col-md-3',
                item: '.object',
            });

            setTimeout(_.bind(function(){
                var pred = localStorage.getItem('prediction');
                if(pred){
                    this.$('.' + pred).click();
                } else {
                    this.$('.fate').click();
                }
            }, this), 1);

            this.updateObjects();

            this.$('.date').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
        },

        evalModel: function(e){
            e.preventDefault();
            webgnome.router.navigate('model', true);
        },

        updateModel: function(){
            var start_time = moment(this.$('#start_time').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
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

            if (target == 'fate' && webgnome.model.get('map').get('obj_type') != 'gnome.map.GnomeMap'){
                if(!confirm('Switching to a Fate only model will remove any geospacial objects (map, currents, etc...).')){
                    return;
                }
                webgnome.model.resetLocation();
                webgnome.model.on('reset:location', webgnome.model.save);
            }

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
            this.mason.layout();
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
            this.updateWind();
            this.updateLocation();
            this.updateWater();
            this.updateSpill();

            this.mason.layout();
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

        updateWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!_.isUndefined(wind)){
                var compiled;
                this.$('.wind .state').addClass('complete');
                if(wind.get('timeseries').length == 1){
                    compiled = _.template(WindPanelTemplate, {
                        speed: wind.get('timeseries')[0][1][0],
                        direction: wind.get('timeseries')[0][1][1],
                        units: wind.get('units')
                    });
                    this.$('.wind').removeClass('col-md-6').addClass('col-md-3');
                } else {
                    compiled = '<div class="axisLabel yaxisLabel">' + wind.get('units') + '</div><div class="chart"></div>';
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
                    this.windPlot = $.plot('.wind .chart', dataset, {
                        grid: {
                            borderWidth: 1,
                            borderColor: '#ddd'
                        },
                        xaxis:{
                            mode: 'time',
                            timezone: 'browser',
                        }
                    });
                }
            } else {
                this.$('.wind .state').removeClass('complete');
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
            waterForm.on('hidden', function(){webgnome.model.trigger('sync');});
            waterForm.on('save', function(){
                webgnome.model.get('environment').add(water);
                webgnome.model.save();
            });
            waterForm.render();
        },

        updateWater: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            if (!_.isUndefined(water)){
                var compiled;
                this.$('.water .state').addClass('complete');
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
                this.$('.water .state').removeClass('complete');
                this.$('.water .panel-body').hide().html('');
            }
        },

        clickSpill: function(){
            var spillTypeForm = new SpillTypeForm();
            spillTypeForm.render();
            spillTypeForm.on('hidden', spillTypeForm.close);
        },

        loadSpill: function(e){
            var spillId = e.currentTarget.attributes[1].value;
            var spill = webgnome.model.get('spills').get(spillId);
            if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                var spillView = new SpillContinueView(null, spill);
            } else {
                var spillView = new SpillInstantView(null, spill);
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

        constructModelTimeSeries: function(){
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
            return timeSeries;
        },

        calculateSpillAmount: function(timeseries){
            var spills = webgnome.model.get('spills');
            var timeStep = webgnome.model.get('time_step');
            var amountArray = [];
            var amount = 0;
            for (var i = 0; i < timeseries.length; i++){
                var upperBound = moment(timeseries[i]).unix();
                var lowerBound = upperBound - timeStep;
                for (var j = 0; j < spills.models.length; j++){
                    var releaseTime = moment(spills.models[j].get('release').get('release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                    var endReleaseTime = moment(spills.models[j].get('release').get('end_release_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
                    var timeDiff = endReleaseTime - releaseTime;
                    if (releaseTime >= lowerBound && endReleaseTime < upperBound && timeDiff <= timeStep){
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
                }
                amountArray.push(amount);
            }
            return amountArray;

        },

        updateSpill: function(){
            var spill = webgnome.model.get('spills');

            this.$('.panel-body').html();
            var timeSeries = this.constructModelTimeSeries();
            var spillArray = this.calculateSpillAmount(timeSeries);
            if(spill.models.length > 0){
                var compiled;
                this.$('.spill .state').addClass('complete');
                compiled = _.template(SpillPanelTemplate, {spills: spill.models});
                var data = [];

                for (var i = 0; i < timeSeries.length; i++){
                    var date = timeSeries[i];
                    var amount = spillArray[i];
                    data.push([parseInt(date, 10), parseInt(amount, 10)]);
                }
                
                var dataset = [
                    {
                        data: data,
                        color: 'rgba(100,149,237,1)',
                        hoverable: true,
                        shadowSize: 0,
                        lines: {
                            show: true,
                            lineWidth: 2,
                            fill: true
                        },
                        points: {
                            show: false
                        }
                    }
                ];

                this.$('.spill').removeClass('col-md-3').addClass('col-md-6');
                this.$('.spill .panel-body').html(compiled);
                this.$('.spill .panel-body').show();

                if(!_.isUndefined(dataset)){
                    this.spillPlot = $.plot('.spill .chart', dataset, {
                        grid: {
                            borderWidth: 1,
                            borderColor: '#ddd',
                            hoverable: true
                        },
                        xaxis: {
                            mode: 'time',
                            timezone: 'browser'
                        },
                        tooltip: true,
                            tooltipOpts: {
                                content: function(label, x, y, flotItem){ return "Time: " + moment(x).calendar() + "<br>Amount: " + y ;}
                            },
                            shifts: {
                                x: -30,
                                y: -50
                            }
                    });
                }
                
            } else {
                this.$('.spill .state').removeClass('complete');
                this.$('.spill .panel-body').hide().html('');
                this.$('.spill').removeClass('col-md-6').addClass('col-md-3');
            }
            
        },

        deleteSpill: function(e){
            e.preventDefault();
            e.stopPropagation();
            var id = e.target.parentNode.dataset.id;
            webgnome.model.get('spills').remove(id);
            webgnome.model.save({
                success: _.bind(function(){
                    this.updateSpill();
                }, this)
            });
        },

        clickLocation: function(){
            var locationForm = new LocationForm();
            locationForm.on('hidden', locationForm.close);
            locationForm.render();
        },

        updateLocation: function(){
            var map = webgnome.model.get('map');
            if(map && map.get('obj_type') != 'gnome.map.GnomeMap'){
                this.$('.location .state').addClass('complete');
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
                }, this));
            } else {
                this.$('.location .state').removeClass('complete');
                this.$('.location .panel-body').hide().html('');
            }
        },

        loadLocation: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
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