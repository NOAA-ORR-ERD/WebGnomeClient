define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'cesium',
    'model/spill',
    'views/form/spill/continue',
    'model/step',
    'mousetrap',
    'jqueryui/slider'
], function($, _, Backbone, BaseView, module, moment, ControlsTemplate, OlMapView, Cesium, GnomeSpill, SpillForm, GnomeStep, Mousetrap){
    'use strict';
    var trajectoryView = BaseView.extend({
        className: 'trajectory-view map ',
        id: 'map',
        spillToggle: false,
        spillCoords: [],
        state: 'loading',
        frame: 0,
        contracted: false,

        events: {
            'click .spill-button .fixed': 'toggleSpill',
            'click .spill-button .moving': 'toggleSpill',
            'click .help-button button': 'renderHelp',
            'mouseout .spill-button': 'toggleSpillBlur',
            'focusout .spill-button': 'toggleSpillBlur',
            'mouseout .help-button': 'helpBlur',
            'focusout .help-button': 'helpBlur',
            'click .play': 'play',
            'click .pause': 'pause',
            'click .next': 'next',
            'click .rewind': 'rewindClick',
            'slide .seek > div': 'seek',
            'slidechange .seek > div': 'loop',
            'slidestop .seek > div': 'blur',
            'click .base input': 'toggleLayers',
            'click .current-grid input': 'toggleGrid',
            'click .current-uv input': 'toggleUV',
            'click .ice-uv input': 'toggleUV',
            'click .ice-grid input[type="radio"]': 'toggleGrid',
            'click .ice-tc input[type="checkbox"]': 'toggleIceTC',
            'click .ice-tc input[type="radio"]': 'toggleIceData'
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.$el.appendTo('body');
            if(webgnome.hasModel()){
                this.modelListeners();
            }
            this.render();
            webgnome.cache.on('rewind', this.rewind, this);
        },

        modelListeners: function(){
            webgnome.model.get('map').on('change', this.resetMap, this);
            webgnome.model.on('change', this.contextualize, this);
            this.spillListeners();
        },

        spillListeners: function(){
            webgnome.model.get('spills').on('add change remove', this.resetSpills, this);
        },

        render: function(){
            BaseView.prototype.render.call(this);

            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            } else {
                date = moment().format('M/DD/YYYY HH:mm');
            }

            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing
            var currents = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                    'gnome.movers.current_movers.ComponentMover',
                    'gnome.movers.current_movers.CurrentCycleMover',
                    'gnome.movers.wind_movers.GridWindmover'
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput'});
            var active_currents = [];
            if(current_outputter.get('on')){
                current_outputter.get('current_movers').forEach(function(mover){
                    active_currents.push(mover.get('id'));
                });
            }
            this.checked_currents = active_currents;

            var ice = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.IceMover';
            });
            var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceRawJsonOutput'});
            var tc_ice = [];
            ice_tc_outputter.get('ice_movers').forEach(function(mover){
                tc_ice.push(mover.get('id'));
            });
            this.tc_ice = tc_ice;

            var compiled = _.template(ControlsTemplate, {
                date: date,
                currents: currents,
                active_currents: active_currents,
                ice: ice,
                tc_ice: tc_ice,
            });
            this.$el.append(compiled);
            this.$('.layers .title').click(_.bind(function(){
                this.$('.layers').toggleClass('expanded');
            }, this));
            
            this.controls = {
                'play': this.$('.controls .play'),
                'pause': this.$('.controls .play'),
                'seek': this.$('.seek > div:first'),
                'fastforward' : this.$('.controls .fastfoward'),
                'rewind': this.$('.controls .rewind'),
                'progress': this.$('.controls .progress-bar'),
                'date': this.$('.controls .position')
            };
            
            var start_time = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            this.controls.seek.slider({
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + start_time + '</div></div>');
                }, this)
            });

            this.contextualize();

            if(localStorage.getItem('advanced') === 'true'){
                this.toggle();
            }

            // add a 250ms timeout to the map render to give js time to add the compiled
            // to the dom before trying to draw the map.
            setTimeout(_.bind(this.renderCesiumMap, this), 250);
        },

        renderCesiumMap: function(){
            if(!this.layers){
                this.layers = {};
            }

            var image_providers = Cesium.createDefaultImageryProviderViewModels();
            var default_image = new Cesium.ProviderViewModel({
                name: 'None',
                tooltip: '',
                iconUrl: '/img/globe.png',
                creationFunction: function(){
                    return new Cesium.SingleTileImageryProvider({
                        url: '/img/globe.png'
                    });
                },
            });
            image_providers.unshift(default_image);
            this.viewer = new Cesium.Viewer('map', {
                animation: false,
                vrButton: false,
                geocoder: false,
                homeButton: false,
                timeline: false,
                sceneModePicker: false,
                targetFrameRate: 30, 
                navigationHelpButton: false,
                navigationInstructionsInitiallyVisible: false,
                skyAtmosphere: false,
                sceneMode: Cesium.SceneMode.SCENE2D,
                mapProjection: new Cesium.WebMercatorProjection(),
                selectedImageryProviderViewModel: default_image,
                imageryProviderViewModels: image_providers,
                clock: new Cesium.Clock({
                    canAnimate: false,
                    shouldAnimate: false
                })
            });

            this.spills = [];
            this.layers.spills = this.spills;
            webgnome.model.get('spills').forEach(_.bind(function(spill){
                var release = spill.get('release');
                this.spills.push(this.viewer.entities.add({
                    name: spill.get('name'),
                    id: spill.get('id'),
                    position: new Cesium.Cartesian3.fromDegrees(release.get('start_position')[0], release.get('start_position')[1]),
                    billboard: {
                        image: '/img/spill-pin.png',
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                    },
                    description: '<table class="table"><tbody><tr><td>Amount</td><td>' + spill.get('amount') + ' ' + spill.get('units') + '</td></tr></tbody></table>'
                }));
            }, this));

            if (this.tc_ice.length > 0) {
                this.toggleIceTC();
            }

            if (this.checked_currents.length > 0){
                this.toggleUV();
            }

            this.layers.map = new Cesium.GeoJsonDataSource();
            webgnome.model.get('map').getGeoJSON(_.bind(function(geojson){
                this.viewer.dataSources.add(this.layers.map.load(geojson, {
                    strokeWidth: 0,
                    stroke: Cesium.Color.WHITE.withAlpha(0)
                }));
            }, this));

            if(webgnome.model.get('map').get('obj_type') !== 'gnome.map.GnomeMap'){
                var bounds = webgnome.model.get('map').get('map_bounds');
                this.viewer.flyTo(this.layers.map, {
                    duration: 0.25
                });
            } else {
                // fly to a gridded current instead
            }

            this.load();
        },

        toggle: function(){
            // if(this.contracted === true){
            //     this.$el.removeClass('contracted');
            //     this.contracted = false;
            // } else {
            //     this.$el.addClass('contracted');
            //     this.contracted = true;
            // }
            
            if(this.ol.map){
                this.ol.map.updateSize();
            }
        },

        contextualize: function(){
            this.enableUI();
            // set the slider to the correct number of steps
            this.controls.seek.slider('option', 'max', webgnome.model.get('num_time_steps') - 1);
        },

        load: function(){
            this.updateProgress();
            this.state = 'pause';
            webgnome.cache.on('step:recieved', this.renderStep, this);
            webgnome.cache.on('step:failed', this.pause, this);
        },

        loop: function(){
            if(this.state === 'play' && this.frame < webgnome.model.get('num_time_steps') - 1){
                if (webgnome.cache.length > this.controls.seek.slider('value')){
                    // the cache has the step, just render it
                    this.renderStep({step: this.controls.seek.slider('value')});
                } else  {
                    this.updateProgress();
                    webgnome.cache.step();
                }
            } else {
                this.pause();
            }
        },

        updateProgress: function(){
            this.controls.progress.addClass('progress-bar-stripes active');
            var percent = Math.round(((webgnome.cache.length) / (webgnome.model.get('num_time_steps') - 1)) * 100);
            this.controls.progress.css('width', percent + '%');
        },

        togglePlay: function(e){
            e.preventDefault();
            if (this.state === 'play') {
                this.pause();
            } else {
                this.play();
            }
        },

        play: function(){
            if($('.modal:visible').length === 0){
                this.state = 'play';
                this.controls.play.addClass('pause').removeClass('play');
                this.loop();
            }
        },

        pause: function(){
            if($('.modal:visible').length === 0){
                this.state = 'pause';
                this.controls.play.addClass('play').removeClass('pause');
                // this.controls.progress.removeClass('active progress-bar-striped');
            }
        },

        rewind: function(){
            this.pause();
            this.controls.seek.slider('value', 0);
            this.controls.progress.css('width', 0);
            this.renderStep({step: 0});
            this.frame = 0;
        },

        rewindClick: function(e){
            webgnome.cache.rewind();
        },

        prev: function(){
            if($('.modal').length === 0){
                this.pause();
                this.controls.seek.slider('value', this.frame - 1);
                this.renderStep({step: this.frame - 1});
            }
        },

        next: function(){
            if($('.modal').length === 0){
                this.pause();
                this.controls.seek.slider('value', this.frame + 1);
                this.renderStep({step: this.frame + 1});
            }
        },

        seek: function(e, ui){
            this.pause();
            this.state = 'seek';
            this.controls.seek.slider('value', ui.value);

            if(ui.value <= webgnome.cache.length){
                this.renderStep({step: ui.value});
            } else {
                this.controls.seek.one('slidestop', _.bind(this.resetSeek, this));
            }
        },

        resetSeek: function(){
            this.controls.seek.slider('value', this.frame);
            this.state = 'pause';
        },

        renderStep: function(source){
            var step;
            if(_.has(source, 'step')){
                webgnome.cache.at(source.step, _.bind(function(err, step){
                    if(!err){
                        this.drawStep(step);
                    }
                }, this));
            } else {
                step = source;
                this.drawStep(step);
            }
        },

        drawStep: function(step){
            if(!step){ return; }
            this.renderSpill(step);
            this.renderCurrent(step);
            this.renderIce(step);

            var time = moment(step.get('TrajectoryGeoJsonOutput').time_stamp.replace('T', ' ')).format('MM/DD/YYYY HH:mm');

            this.controls.date.text(time);
            this.frame = step.get('step_num');
            if(this.frame < webgnome.model.get('num_time_steps') && this.state === 'play'){
                this.drawStepTimeout = setTimeout(_.bind(function(){
                    this.controls.seek.slider('value', this.frame + 1);
                }, this), 60);
            } else {
                this.pause();
            }
            this.$('.tooltip-inner').text(time);
        },

        renderSpill: function(step){
            if(!this.les){
                // this is the first time le are being rendered
                // create a new datasource to handle the entities
                this.les = new Cesium.BillboardCollection();
                this.layers.particles = this.les;
                this.certain_collection = [];
                this.uncertain_collection = [];
                this.viewer.scene.primitives.add(this.les);

                var canvas = document.createElement('canvas');
                canvas.width = 4;
                canvas.height = 4;
                var context2D = canvas.getContext('2d');
                context2D.beginPath();
                context2D.arc(2, 2, 2, 0, Cesium.Math.TWO_PI, true);
                context2D.closePath();
                context2D.fillStyle = 'rgb(255, 255, 255)';
                context2D.fill();
                this.les_point_image = this.les.add({image: canvas, show: false}).image;

                canvas = document.createElement('canvas');
                canvas.width = 10;
                canvas.height = 10;
                context2D = canvas.getContext('2d');
                context2D.moveTo(0, 0);
                context2D.lineTo(8, 8);
                context2D.moveTo(8, 7);
                context2D.lineTo(1, 0);
                context2D.moveTo(0, 1);
                context2D.lineTo(7, 8);

                context2D.moveTo(0, 8);
                context2D.lineTo(8, 0);
                context2D.moveTo(7, 0);
                context2D.lineTo(0, 7);
                context2D.moveTo(1, 8);
                context2D.lineTo(8, 1);

                context2D.strokeStyle = 'rgb(255, 255, 255)';
                context2D.stroke();
                this.les_beached_image = this.les.add({image: canvas, show: false}).image;

            }

            var certain_json_features = step.get('TrajectoryGeoJsonOutput').certain.features;
            var uncertain_json_features = step.get('TrajectoryGeoJsonOutput').uncertain.features;
            var visible = !this.checked_layers || this.checked_layers.indexOf('particles') !== -1 ? true : false;

            for(var f = 0; f < certain_json_features.length; f++){
                if(!this.certain_collection[f]){
                    // create a new point
                    this.certain_collection.push(this.les.add({
                        position: Cesium.Cartesian3.fromDegrees(certain_json_features[f].geometry.coordinates[0], certain_json_features[f].geometry.coordinates[1]),
                        color: Cesium.Color.BLACK,
                        image: certain_json_features[f].properties.status_code === 2 ? this.les_point_image : this.les_beached_image
                    }));

                    if (uncertain_json_features.length > 0) {
                        this.uncertain_collection.push(this.les.add({
                            position: Cesium.Cartesian3.fromDegrees(uncertain_json_features[f].geometry.coordinates[0], uncertain_json_features[f].geometry.coordinates[1]),
                            color: Cesium.Color.RED,
                            image: uncertain_json_features[f].properties.status_code === 2 ? this.les_point_image : this.les_beached_image
                        }));
                    }
                } else {
                    // update the point position and graphical representation
                    this.certain_collection[f].position = Cesium.Cartesian3.fromDegrees(certain_json_features[f].geometry.coordinates[0], certain_json_features[f].geometry.coordinates[1]);
                    if(certain_json_features[f].properties.status_code === 3){
                        this.certain_collection[f].image = this.les_beached_image;
                    } else {
                        this.certain_collection[f].image = this.les_point_image;
                    }

                    if (uncertain_json_features.length > 0) {
                        this.uncertain_collection[f].position = Cesium.Cartesian3.fromDegrees(uncertain_json_features[f].geometry.coordinates[0], uncertain_json_features[f].geometry.coordinates[1]);

                        if(uncertain_json_features[f].properties.status_code === 3){
                            this.uncertain_collection[f].image = this.les_beached_image;
                        } else {
                            this.uncertain_collection[f].image = this.les_point_image;
                        }
                    }
                }

                // set visibility of the particle
                this.certain_collection[f].show = visible;
                if(this.uncertain_collection[f]){
                    this.uncertain_collection[f].show = visible;
                }
            }

            if(this.certain_collection.length > certain_json_features.length){
                // we have entites that were created for a future step but the model is now viewing a previous step
                // hide the leftover particles
                for(var l = certain_json_features.length; l < this.certain_collection.length; l++){
                    this.certain_collection[l].show = false;
                    if(this.uncertain_collection[l]){
                        this.uncertain_collection[l].show = false;
                    }
                }
            }
        },

        renderCurrent: function(step){
            if(step.get('CurrentGeoJsonOutput') && this.checked_currents && this.checked_currents.length > 0 && this.layers.uv){
                // hardcode to the first indexed id, because the ui only supports a single current being selected at the moment
                var id = this.checked_currents[0];
                var data = step.get('CurrentGeoJsonOutput')[id];
                if(data && this.current_arrow[id]){
                    for(var uv = data.direction.length; uv--;){
                        this.layers.uv[id].get(uv).show = true;
                        if(this.layers.uv[id].get(uv).rotation !== data.direction[uv]){
                            this.layers.uv[id].get(uv).rotation = data.direction[uv];
                        }
                        if(this.layers.uv[id].get(uv).image !== this.uvImage(data.magnitude[uv], id)){
                            this.layers.uv[id].get(uv).image = this.uvImage(data.magnitude[uv], id);
                        }
                    }
                } else if(this.layers.uv[id]){
                    for(var h = this.layers.uv[id].length; h--;){
                        this.layers.uv[id].get(h).show = false;
                    }
                }
            }
        },

        uvImage: function(magnitude, id){
            return this.current_arrow[id][Math.round(Math.abs(magnitude)*10)/10];
        },

        renderIceImage: function(step){
            var source;
            var ice_data = this.$('.ice-tc input[type="radio"]:checked').val();

            if(step && step.get('IceImageOutput') && this.tc_ice && this.tc_ice.length > 0){
                var image = step.get('IceImageOutput')[ice_data + '_image'];
                var bb = step.get('IceImageOutput').bounding_box;
                var coords = [[bb[0], [bb[0][0], bb[1][1]], bb[1], [bb[1][0], bb[0][1]]]];
                var poly = new ol.geom.Polygon(coords).transform('EPSG:4326', 'EPSG:3857');
                source = new ol.source.ImageStatic({
                    url: image,
                    imageSize: [1000, 1000],
                    imageExtent: poly.getExtent(),
                    projection: step.get('IceImageOutput').projection,
                    imageLoadFunction: function(imageTile, src){
                        var imageElement = imageTile.getImage();
                        imageElement.src = src;
                    }
                });
            } else {
                source = new ol.source.ImageStatic({
                    url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    imageSize: [1, 1],
                    imageExtent: [-20000000000, -2000000000, 2000000000, 20000000],
                    imageLoadFunction: function(imageTile, src){
                        var imageElement = imageTile.getImage();
                        imageElement.src = src;
                    }
                });
            }

            this.IceImageLayer.setSource(source);
        },

        renderIce: function(step){
            var outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceRawJsonOutput'});
            if(step && step.get('IceRawJsonOutput') && outputter.get('ice_movers').length > 0 && this.ice_grid){
                var mover = outputter.get('ice_movers').at(0);
                var data = step.get('IceRawJsonOutput').data[mover.get('id')];
                if(!data){ return null; }

                var vis = $('.ice-tc input[type="radio"]:checked').val();
                var colorBuffer = new Uint8Array(4);
                colorBuffer[2] = 255;

                if(data[vis].length > 0){
                    // update existing grid with color data
                    for(var cell = data[vis].length; cell--;){
                        this.iceValueToAlpha(vis, data[vis][cell], colorBuffer);
                        if(colorBuffer[3] !== this.ice_grid[cell].color[3]){
                            this.ice_grid[cell].color[3] = colorBuffer[3];
                            this.ice_grid[cell].color = this.ice_grid[cell].color;
                        }
                    }
                }
            }
        },

        iceValueToAlpha: function(name, value, colorBuffer){
            if(name[0] === 'c'){
                colorBuffer[3] = ~~(value * 255);
            } else {
                colorBuffer[3] = ~~((value * 0.1666666667) * 255);
            }
        },

        disableUI: function(){
            // visually disable the interface and remove listeners
            this.controls.seek.slider('option', 'disabled', true);
            this.$('.buttons a').addClass('disabled');
            Mousetrap.unbind('space');
            Mousetrap.unbind('right');
            Mousetrap.unbind('left');
        },

        enableUI: function(){
            // visusally enable the interface and add listeners
            this.controls.seek.slider('option', 'disabled', false);
            this.$('.buttons a').removeClass('disabled');
            Mousetrap.bind('space', _.bind(this.togglePlay, this));
            Mousetrap.bind('right', _.bind(this.next, this));
            Mousetrap.bind('left', _.bind(this.prev, this));
        },

        toggleLayers: function(event){
            var checked_layers = this.checked_layers = [];
            this.$('.layers input:checked').each(function(i, input){
                checked_layers.push(input.id);
            });

            if(checked_layers.indexOf('noaanavcharts') !== -1){
                if (!this.layers.nav) {
                    this.layers.nav = this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                        layers: '1',
                        url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                    }));
                    this.layers.nav.alpha = 0.60;
                }
            } else if(this.layers.nav) {
                this.viewer.imageryLayers.remove(this.layers.nav);
                delete this.layers.nav;
            }

            if(checked_layers.indexOf('modelmap') !== -1){
                this.layers.map.show = true;
            } else {
                this.layers.map.show = false;
            }

            if(checked_layers.indexOf('spills') !== -1){
                for(var spill in this.layers.spills){
                    this.layers.spills[spill].show = true;
                }
            } else {
                for(var spill in this.layers.spills){
                    this.layers.spills[spill].show = false;
                }
            }

            // start at two because of the two billboard primitives added for image reference
            if(checked_layers.indexOf('particles') !== -1 && this.layers.particles){
                for(var part = 2; part < this.layers.particles.length; part++){
                    this.layers.particles.get(part).show = true;
                }
            } else if(this.layers.particles) {
                for(var part = 2; part < this.layers.particles.length; part++){
                    this.layers.particles.get(part).show = false;
                }
            }

            if(checked_layers.indexOf('spillableArea') !== -1){
                if(!this.layers.spillable){
                    this.layers.spillable = [];
                    var polygons = webgnome.model.get('map').get('spillable_area');
                    for(var poly in polygons){
                        this.layers.spillable.push(this.viewer.entities.add({ 
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                                material: Cesium.Color.BLUE.withAlpha(0.25),
                                outline: true,
                                outlineColor: Cesium.Color.BLUE.withAlpha(0.75)
                            }
                        }));    
                    }
                } else {
                    for(var area in this.layers.spillable){
                        this.layers.spillable[area].show = true;
                    }
                }
            } else if(this.layers.spillable){
                for(var area in this.layers.spillable){
                    this.layers.spillable[area].show = false;
                }
            }

            if(checked_layers.indexOf('map_bounds') !== -1){
                if(!this.layers.bounds){
                    var map = webgnome.model.get('map');
                    this.layers.bounds = this.viewer.entities.add({
                        name: 'Map Bounds',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(map.get('map_bounds'))),
                            material: Cesium.Color.WHITE.withAlpha(0),
                            outline: true,
                            outlineColor: Cesium.Color.BLUE,
                        }
                    });                    
                } else {
                    this.layers.bounds.show = true;
                } 
            } else if(this.layers.bounds){
                this.layers.bounds.show = false;
            }
        },

        toggleGrid: function(e){
            if(!this.grids){
                this.grids = {};
            }
            var existing_grids = _.keys(this.grids);
            for(var grid = 0; grid < existing_grids.length; grid++){
                for(var prims = this.grids[existing_grids[grid]].length; prims--;){
                    this.grids[existing_grids[grid]][prims].show = false;
                }
            }

            var id = this.$(e.currentTarget).attr('id').replace('grid-', '');
            if(_.has(this.grids, id)){
                // need to hide the entire set of grids.
                for(var active_prim = this.grids[id].length; active_prim--;){
                    this.grids[id][active_prim].show = true;
                }
            } else if(id !== 'none-grid'){
                var current = webgnome.model.get('movers').findWhere({id: id});
                current.getGrid(_.bind(function(data){
                    var color = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.PINK.withAlpha(0.3));
                    this.grids[current.get('id')]  = [];
                    var batch = 3000;
                    var batch_limit = Math.ceil(data.length / batch);
                    var segment = 0;
                    for(var b = 0; b < batch_limit; b++){
                        // setup the new batch
                        var geo = [];

                        // build the batch
                        var limit = segment + batch;
                        for(var cell = segment; cell < limit; cell++){
                            if(data[cell]){
                                geo.push(new Cesium.GeometryInstance({
                                    geometry: new Cesium.SimplePolylineGeometry({
                                        positions: Cesium.Cartesian3.fromDegreesArray(data[cell])
                                    }),
                                    attributes: {
                                        color: color
                                    },
                                    allowPicking: false
                                }));
                            }
                        }

                        segment += batch;

                        // send the batch to the gpu/cesium
                        this.grids[current.get('id')].push(this.viewer.scene.primitives.add(new Cesium.Primitive({
                            geometryInstances: geo,
                            appearance: new Cesium.PerInstanceColorAppearance({
                                flat: true,
                                translucent: false
                            })
                        })));
                    }
                        
                }, this));
            }
        },

        toggleUV: function(e){
            var checked = this.$('.current-uv input:checked, .ice-uv input:checked');
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput'});

            var uv_layers = _.keys(this.layers.uv);
            for(var l = 0; l < uv_layers.length; l++){
                for(var bb = this.layers.uv[uv_layers[l]].length; bb--;){
                    this.layers.uv[uv_layers[l]].get(bb).show = false;
                }
            }

            var id = $(checked[0]).attr('id').replace('uv-', '');
            if (checked.length > 0 && id !== 'none-uv'){
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];

                this.$('.current-uv input:checked, .ice-uv input:checked').each(_.bind(function(i, input){
                    var current = webgnome.model.get('movers').get(id);
                    current.getCenters(_.bind(function(centers){
                        if(!this.layers.uv){
                            this.layers.uv = {};
                        }

                        if(!this.layers.uv[id]){
                            this.layers.uv[id] = new Cesium.BillboardCollection();
                            this.viewer.scene.primitives.add(this.layers.uv[id]);
                            this.generateUVTextures(this.layers.uv[id], id);
                        }

                        var layer = this.layers.uv[id];

                        // update the positions of any existing centers
                        var existing_length = this.layers.uv[id].length;
                        for(var existing = 0; existing < existing_length; existing++){
                            layer.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing][0], centers[existing][1]);
                            layer.get(existing).show = false;
                        }

                        var create_length = centers.length;
                        for(var c = existing_length; c < create_length; c++){
                            layer.add({
                                show: false,
                                position: Cesium.Cartesian3.fromDegrees(centers[c][0], centers[c][1]),
                                image: this.current_arrow[id][0]
                            });
                        }
                    }, this));

                    this.checked_currents.push(id);
                    current_outputter.get('current_movers').add(current);
                }, this));
            } else {
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];
            }
            if(this.state === 'pause'){
                this.renderStep({step: this.frame});
            }

            current_outputter.save();
        },

        generateUVTextures: function(layer, id){
            if(!this.current_arrow){
                this.current_arrow = {};
            }
            if(!this.current_arrow[id]){
                this.current_arrow[id] = {};
                // generate a canvas based texture for each size arrow we want
                // 0.0, 0.1, 0.2, etc...
                
                var canvas = document.createElement('canvas');
                canvas.width = 7;
                canvas.height = 7;
                var ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(3.5, 3.5, 2, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(204, 0, 204, 1)';
                ctx.stroke();
                this.current_arrow[id][0] = layer.add({
                    image: canvas, 
                    show: false,
                }).image;

                var angle = 0.785398163;
                var width = 60;
                var center = width / 2;

                for(var a = 0.1; a < 3.0; a += 0.1){
                    var s_a = Math.round(a*10)/10;
                    canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = s_a * 60;
                    ctx = canvas.getContext('2d');

                    var len = Math.abs(canvas.height / Math.log(canvas.height));
                    var rad = Math.PI / 2;

                    var arr_left = [(center + len * Math.cos(rad - angle)), (0 + len * Math.sin(rad - angle))];
                    var arr_right =[(center + len * Math.cos(rad + angle)), (0 + len * Math.sin(rad + angle))];

                    ctx.moveTo(center, canvas.height);
                    ctx.lineTo(center, 0);
                    ctx.lineTo(arr_right[0], arr_right[1]);
                    ctx.moveTo(arr_left[0], arr_left[1]);
                    ctx.lineTo(center, 0);
                    ctx.strokeStyle = 'rgba(204, 0, 204, 1)';
                    ctx.stroke();

                    this.current_arrow[id][s_a] = layer.add({
                        image: canvas, 
                        show: false,
                    }).image;    
                }
            }
        },

        toggleIceTC: function(e){
            var checked = this.$('.ice-tc input[type="checkbox"]:checked');
            // var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'});
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceRawJsonOutput'});
            if (checked.length > 0){
                current_outputter.get('ice_movers').reset();

                this.$('.ice-tc input[type="checkbox"]:checked').each(_.bind(function(i, input){
                    var id = input.id.replace('tc-', '');
                    var current = webgnome.model.get('movers').get(id);
                    current.getGrid(_.bind(function(grid){
                        if(!this.layers.ice){
                            var ice = [];
                            for(var cell = grid.length; cell--;){
                                ice.push(new Cesium.GeometryInstance({
                                    geometry: new Cesium.PolygonGeometry({
                                        polygonHierarchy: {
                                            positions: Cesium.Cartesian3.fromDegreesArray(grid[cell])
                                        },
                                        vertextFormat: Cesium.VertexFormat.POSITION_AND_COLOR
                                    }),
                                    'id': cell,
                                    attributes: {
                                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE.withAlpha(0))
                                    }
                                }));
                            }
                            if(ice.length > 0){
                                this.layers.ice = this.viewer.scene.primitives.add(new Cesium.Primitive({
                                    geometryInstances: ice,
                                    appearance: new Cesium.PerInstanceColorAppearance({
                                        flat: true,
                                        translucent: true
                                    })
                                }));
                                this.layers.ice.readyPromise.then(_.bind(function(){
                                    this.ice_grid = [];
                                    for(cell = grid.length; cell--;){
                                        this.ice_grid.push(this.layers.ice.getGeometryInstanceAttributes(cell));
                                    }
                                    this.ice_grid.reverse();
                                }, this));
                            }
                        } else {
                            this.layers.ice.show = true;
                        }
                    }, this));
                    current_outputter.get('ice_movers').add(current);
                }, this));
            } else {
                current_outputter.get('ice_movers').reset();
                this.layers.ice.show = false;
            }

            if(this.state === 'pause'){
                this.renderStep({step: this.frame});
            }
            current_outputter.save();
        },

        toggleIceData: function(e){
            this.renderStep({step: this.frame});
        },

        toggleSpill: function(e){
            if(this.spillToggle){
                this.ol.map.getViewport().style.cursor = '';
                this.spillToggle = false;
                this.spillCoords = [];

                if(this.$('.on').hasClass('fixed')){
                    this.ol.map.un('click', this.addPointSpill, this);
                } else {
                    this.ol.map.removeInteraction(this.draw);
                }

                this.$('.on').toggleClass('on');

            } else {
                this.ol.map.getViewport().style.cursor = 'crosshair';
                this.spillToggle = true;
                this.$(e.target).toggleClass('on');

                if(this.$(e.target).hasClass('fixed')){
                    this.ol.map.on('click', this.addPointSpill, this);
                } else {
                    this.addLineSpill();
                }
            }
        },

        toggleSpillBlur: function(event){
            event.target.blur();
        },

        showHelp: function(){
            this.$('.help-button').show();
        },

        helpBlur: function(e){
            e.target.blur();
        },

        renderSpills: function(){
            // foreach spill add at feature to the source
            var spills = webgnome.model.get('spills');
            spills.forEach(function(spill){
                var start_position = spill.get('release').get('start_position');
                var end_position = spill.get('release').get('end_position');
                var geom;
                if(start_position.length > 2 && start_position[0] === end_position[0] && start_position[1] === end_position[1]){
                    start_position = [start_position[0], start_position[1]];
                    geom = new ol.geom.Point(ol.proj.transform(start_position, 'EPSG:4326', this.ol.map.getView().getProjection()));
                } else {
                    start_position = [start_position[0], start_position[1]];
                    end_position = [end_position[0], end_position[1]];
                    geom = new ol.geom.LineString([ol.proj.transform(start_position, 'EPSG:4326', this.ol.map.getView().getProjection()), ol.proj.transform(end_position, 'EPSG:4326', this.ol.map.getView().getProjection())]);
                }
                var feature = new ol.Feature({
                    geometry: geom,
                    spill: spill.get('id')
                });
                this.SpillIndexSource.addFeature(feature);
            }, this);
        },

        resetSpills: function(){
            // remove all spills from the source.
            this.SpillIndexSource.clear();
            this.renderSpills();
        },

        addLineSpill: function(e){
            this.draw = new ol.interaction.Draw({
                source: this.SpillIndexSource,
                type: 'LineString'
            });
            this.ol.map.addInteraction(this.draw);
            this.draw.on('drawend', _.bind(function(e){
                var spillCoords = e.feature.getGeometry().getCoordinates();
                for (var i = 0; i < spillCoords.length; i++){
                    spillCoords[i] = new ol.proj.transform(spillCoords[i], 'EPSG:3857', 'EPSG:4326');
                    spillCoords[i].push('0');
                }
                var spill = new GnomeSpill();
                spill.get('release').set('start_position', spillCoords[0]);
                spill.get('release').set('end_position', spillCoords[spillCoords.length - 1]);
                spill.get('release').set('release_time', webgnome.model.get('start_time'));
                spill.get('release').set('end_release_time', webgnome.model.get('start_time'));
                var spillform = new SpillForm({showMap: true}, spill);
                spillform.render();
                spillform.on('save', function(spill){
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.trigger('sync');
                });
                spillform.on('hidden', spillform.close);
                this.toggleSpill();

            }, this));
        },

        addPointSpill: function(e){
            // add a spill to the model.
            var coord = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
            var spill = new GnomeSpill();
            // add the dummy z-index thing
            coord.push(0);
            spill.get('release').set('start_position', coord);
            spill.get('release').set('end_position', coord);
            spill.get('release').set('release_time', webgnome.model.get('start_time'));
            spill.get('release').set('end_release_time', webgnome.model.get('start_time'));

            var spillform = new SpillForm({showMap: true}, spill);
            spillform.render();
            spillform.on('save', function(spill){
                webgnome.model.get('spills').add(spill);
                webgnome.model.trigger('sync');
            });
            spillform.on('hidden', spillform.close);

            this.toggleSpill();
        },

        spillHover: function(e){
            if(!this.spillToggle){
                var pointer = this.ol.map.forEachFeatureAtPixel(e.pixel, function(){
                    return true;
                }, null, function(layer){
                    if(layer.get('name') === 'spills'){
                        return layer;
                    }
                    return false;
                });
                if (pointer) {
                    this.ol.map.getViewport().style.cursor = 'pointer';
                } else if(this.ol.map.getViewport().style.cursor === 'pointer') {
                    this.ol.map.getViewport().style.cursor = '';
                }
            }
        },

        spillClick: function(e){
            var spill = this.ol.map.forEachFeatureAtPixel(e.pixel, function(feature){
                return feature.get('spill');
            }, null, function(layer){
                if(layer.get('name') === 'spills'){
                    return layer;
                }
                return false;
            });
            if(spill){
                var spillform = new SpillForm({showMap: true}, webgnome.model.get('spills').get(spill));
                spillform.on('hidden', spillform.close);
                spillform.on('save', function(spill){
                    webgnome.model.get('spills').trigger('change');
                    webgnome.model.trigger('sync');
                });
                spillform.render();
            }
        },

        resetMap: function(){
            this.ol.redraw = true;
            this.render();
        },

        blur: function(e, ui){
            ui.handle.blur();
        },

        close: function(){
            this.pause();
            if(webgnome.model){
                webgnome.model.off('change', this.contextualize, this);
                webgnome.model.off('sync', this.spillListeners, this);
                webgnome.model.get('spills').off('add change remove', this.resetSpills, this);
            }
            if(this.drawStepTimeout){
                clearTimeout(this.drawStepTimeout);
            }
            webgnome.cache.off('step:recieved', this.renderStep, this);
            webgnome.cache.off('step:failed', this.pause, this);
            webgnome.cache.off('rewind', this.rewind, this);

            Mousetrap.unbind('space');
            Mousetrap.unbind('right');
            Mousetrap.unbind('left');
            this.remove();
            this.unbind();
            this.viewer.destroy();
        }
    });

    return trajectoryView;
});