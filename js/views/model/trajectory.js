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
        state: 'pause',
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
            var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.image.IceImageOutput'});
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
            var image_providers = Cesium.createDefaultImageryProviderViewModels();
            var default_image = new Cesium.ProviderViewModel({
                name: 'Blank',
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
                geocode: false,
                homeButton: false,
                timeline: false,
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

            var map = webgnome.model.get('map');
            var bounds = this.viewer.entities.add({
                name: 'Map Bounds',
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(map.get('map_bounds'))),
                    material: Cesium.Color.WHITE.withAlpha(0),
                    outline: true,
                    outlineColor: Cesium.Color.BLUE,
                    show:true
                }
            });
            this.viewer.flyTo(bounds, {
                duration: 1.0,
            });

            map.getGeoJSON(_.bind(function(geojson){
                this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geojson, {
                    strokeWidth: 0,
                    stroke: Cesium.Color.WHITE.withAlpha(0)
                }));
            }, this));
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
            if(webgnome.model.get('messages').length < 1){
                this.play();
            }
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
                        this.drawStep(new GnomeStep(step));
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
            // this.renderCurrent(step);
            // this.renderIce(step);

            this.controls.date.text(moment(step.get('TrajectoryGeoJsonOutput').time_stamp.replace('T', ' ')).format('MM/DD/YYYY HH:mm'));
            this.frame = step.get('step_num');
            if(this.frame < webgnome.model.get('num_time_steps') && this.state === 'play'){
                this.drawStepTimeout = setTimeout(_.bind(function(){
                    this.controls.seek.slider('value', this.frame + 1);
                }, this), 60);
            } else {
                this.pause();
            }
        },

        renderSpill: function(step){
            if(!this.les){
                // this is the first time le are being rendered
                // create a new datasource to handle the entities
                this.les = new Cesium.BillboardCollection();
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

            for(var f = 0; f < certain_json_features.length; f++){
                if(!this.certain_collection[f]){
                    // create a new point
                    this.certain_collection.push(this.les.add({
                        position: Cesium.Cartesian3.fromDegrees(certain_json_features[f].geometry.coordinates[0], certain_json_features[f].geometry.coordinates[1]),
                        color: Cesium.Color.BLACK,
                        image: certain_json_features[f].properties.status_code === 2 ? this.les_point_image : this.les_beached_image
                    }));
                    this.uncertain_collection.push(this.les.add({
                        position: Cesium.Cartesian3.fromDegrees(uncertain_json_features[f].geometry.coordinates[0], uncertain_json_features[f].geometry.coordinates[1]),
                        color: Cesium.Color.RED,
                        image: uncertain_json_features[f].properties.status_code === 2 ? this.les_point_image : this.les_beached_image
                    }));
                } else {
                    // update the point
                    this.certain_collection[f].position = Cesium.Cartesian3.fromDegrees(certain_json_features[f].geometry.coordinates[0], certain_json_features[f].geometry.coordinates[1]);
                    this.certain_collection[f].show = true;
                    this.uncertain_collection[f].position = Cesium.Cartesian3.fromDegrees(uncertain_json_features[f].geometry.coordinates[0], uncertain_json_features[f].geometry.coordinates[1]);
                    this.uncertain_collection[f].show = true;

                    if(certain_json_features[f].properties.status_code === 3){
                        this.certain_collection[f].image = this.les_beached_image;
                    } else {
                        this.certain_collection[f].image = this.les_point_image;
                    }
                    if(uncertain_json_features[f].properties.status_code === 3){
                        this.uncertain_collection[f].image = this.les_beached_image;
                    } else {
                        this.uncertain_collection[f].image = this.les_point_image;
                    }
                }
            }
            if(this.certain_collection.length > certain_json_features.length){
                // we have entites that were created for a future step but the model is now viewing a previous step
                // hide the leftover entities
                for(var l = certain_json_features.length; l < this.certain_collection.length; l++){
                    this.certain_collection[l].show = false;
                    this.uncertain_collection[l].show = false;
                }
            }

            // var traj_source = new ol.source.Vector({
            //     features: (new ol.format.GeoJSON()).readFeatures(step.get('TrajectoryGeoJsonOutput').feature_collection,  {featureProjection: 'EPSG:3857'}),
            //     useSpatialIndex: false
            // });
            // this.SpillLayer.setSource(traj_source);
        },

        renderCurrent: function(step){
            var current_features = [];
            if(step.get('CurrentGeoJsonOutput') && this.checked_currents && this.checked_currents.length > 0){
                var currents = step.get('CurrentGeoJsonOutput').feature_collections;
                for(var i = 0; i < this.checked_currents.length; i++){
                    var id = this.checked_currents[i];
                    if(_.has(currents, id)){
                        for (var c = 0; c < currents[id].features.length; c++){
                            var coords = currents[id].features[c].geometry.coordinates;
                            for(var co = 0; co < coords.length; co++){
                                var feature_coords = ol.proj.transform(coords[co], 'EPSG:4326', 'EPSG:3857');
                                var velocity = currents[id].features[c].properties.velocity;
                                var f = new ol.Feature({
                                    geometry: new ol.geom.Point(feature_coords)
                                });
                                f.set('velocity', velocity);

                                current_features.push(f);  
                            }
                        }
                    }
                }
            }
            var cur_source = new ol.source.Vector({
                features: current_features
            });

            var cur_cluster = new ol.source.Cluster({
                source: cur_source,
                distance: 30
            });

            var cur_image = new ol.source.ImageVector({
                source: cur_cluster,
                style: this.styles.currents
            });

            this.CurrentLayer.setSource(cur_image);
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

        /**
         * Create or update a layers source features (conceptually a grid)
         * @param {ol.vector.Source} source Vector source you want to project the data on to
         * @param {Object|GeoJson} grid Geographical representation of where the nodes/cells should be
         * @param {Object} data Dictionary/Object of parameters you want to apply to the grid
         */
        updateGridedData: function(source, grid, data){
            var properties = _.keys(data);
            if(source.getFeatures().length > 0){
                // this data's grid is already set up, just update the data.

            } else {
                // this data's grid isn't setup, set it up and set the data at the same time
                var new_features = (new ol.format.GeoJSON()).readFeatures(grid, {featureProjection: 'EPSG:3857'});
                for(var f = 0; f < new_features.length; f++){
                    for(var p = 0; p < properties.length; p++){
                        new_features[f].set(properties[p], data[properties[p]][f], true);
                    }
                }
                source.addFeatures(new_features);
            }
        },

        renderIce: function(step){
            var outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceRawJsonOutput'});
            if(step && step.get('IceRawJsonOutput') && outputter.get('ice_movers').length > 0){
                var mover = outputter.get('ice_movers').at(0);
                var data = step.get('IceRawJsonOutput').data[mover.get('id')];
                mover.getGrid(_.bind(function(grid){
                    this.updateGridedData(this.IceLayer.getSource(), grid, data);
                }, this));
            }


            // var ice_features = [];
            // var ice_data = this.$('input[name=ice_data]:checked').val();

            // if(step && step.get('IceGeoJsonOutput') && this.tc_ice && this.tc_ice.length > 0){
            //     var ice = step.get('IceGeoJsonOutput').feature_collections;
            //     for(var t = 0; t < this.tc_ice.length; t++){
            //         var id = this.tc_ice[t];
            //         if(_.has(ice, id)){
            //             var features;
            //             if(ice_data === 'thickness'){
            //                 features = ice[id][1].features;
            //             } else {
            //                 features = ice[id][0].features;
            //             }
            //             for(var r = 0; r < features.length; r++){
            //                 var coords = features[r].geometry.coordinates;
            //                 var poly = new ol.geom.MultiPolygon([coords]);
            //                 poly.transform('EPSG:4326', 'EPSG:3857');
            //                 var properties = {
            //                     geometry: poly
            //                 };
            //                 properties[ice_data] = features[r].properties[ice_data];
                            
            //                 var f = new ol.Feature(properties);
            //                 ice_features.push(f);
            //             }
            //         }
            //     }
            // }
            // var ice_source = new ol.source.Vector({
            //     features: ice_features,
            //     useSpatialIndex: false
            // });

            // var ice_image = new ol.source.ImageVector({
            //     source: ice_source,
            //     style: this.styles.ice[ice_data]
            // });

            // this.IceLayer.setSource(ice_image);
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
            var checked_layers = [];
            this.$('.layers input:checked').each(function(i, input){
                checked_layers.push(input.id);
            });
            var base_layer = this.$('.layers input[name="maplayer"]:checked').val();

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('type') === 'base'){
                    if (base_layer !== 'none'){
                        if(layer.get('name') === base_layer){
                            layer.setVisible(true);
                        } else {
                            layer.setVisible(false);
                        }
                    } else {
                        layer.setVisible(false);
                    }
                } else if (checked_layers.indexOf(layer.get('name')) !== -1 || layer.get('name') === 'currents'){
                    layer.setVisible(true);
                } else if (_.isUndefined(layer.get('id'))){
                    layer.setVisible(false);
                }
            });
        },

        toggleGrid: function(e){
            var id = this.$(e.currentTarget).attr('id');
            var checked = this.$(e.currentTarget).is(':checked');

            var current = webgnome.model.get('movers').findWhere({id: id.replace('grid-', '')});
            current.getGrid(_.bind(function(data){
                var grid = new Cesium.EntityCollection();

                for(var cell = 0; cell < data.length; cell++){
                    this.viewer.entities.add({
                        name: 'grid-' + current.get('id'),
                        polygon:{
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(data[cell])),
                            material: Cesium.Color.PINK.withAlpha(0.1),
                            outlineColor: Cesium.Color.PINK.withAlpha(0.7),
                            outline: true
                        }
                    });
                }
            }, this));

            // this.ol.map.getLayers().forEach(function(layer){
            //     if (layer.get('id') === id){
            //         gridLayer = layer;
            //     }
            // });
            
            // if (_.isUndefined(gridLayer) && id !== 'none-grid'){
            //     var current = webgnome.model.get('movers').findWhere({id: id.replace('grid-', '')});
            //     current.getGrid(_.bind(function(grid){
            //         if (grid){
            //             gridLayer = new ol.layer.Vector({
            //                 id: id,
            //                 type: 'grid',
            //                 source: new ol.source.Vector({
            //                     features: grid
            //                 }),
            //                 style: this.styles.currents_grid
            //             });
            //             this.ol.map.getLayers().insertAt(3, gridLayer);
            //         }
            //     }, this));
            // } 

            // this.ol.map.getLayers().forEach(function(layer){
            //     if (layer.get('id') === id && layer.get('type') === 'grid'){
            //         layer.setVisible(true);
            //     } else if(layer.get('id') !== id && layer.get('type') === 'grid' || id === 'none-grid' && layer.get('type') === 'grid'){
            //         layer.setVisible(false);
            //     }
            // });
        },

        toggleUV: function(e){
            var checked = this.$('.current-uv input:checked, .ice-uv input:checked');
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput'});

            if (checked.length > 0){
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];

                this.$('.current-uv input:checked, .ice-uv input:checked').each(_.bind(function(i, input){
                    var id = input.id.replace('uv-', '');
                    var current = webgnome.model.get('movers').get(id);
                    this.checked_currents.push(id);
                    current_outputter.get('current_movers').add(current);
                }, this));
            } else {
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];
            }
            this.renderStep({step: this.frame});

            current_outputter.save();
        },

        toggleIceTC: function(e){
            var checked = this.$('.ice-tc input:checked');
            // var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'});
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceRawJsonOutput'});
            if (checked.length > 0){
                current_outputter.get('ice_movers').reset();

                this.$('.ice-tc input[type="checkbox"]:checked').each(_.bind(function(i, input){
                    var id = input.id.replace('tc-', '');
                    var current = webgnome.model.get('movers').get(id);
                    current.getGrid();
                    current_outputter.get('ice_movers').add(current);
                }, this));
            } else {
                current_outputter.get('ice_movers').reset();
            }

            this.renderStep({step: this.frame});
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