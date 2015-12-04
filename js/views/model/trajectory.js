define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'ol',
    'model/spill',
    'views/form/spill/continue',
    'model/step',
    'mousetrap',
    'jqueryui/slider'
], function($, _, Backbone, BaseView, module, moment, ControlsTemplate, OlMapView, ol, GnomeSpill, SpillForm, GnomeStep, Mousetrap){
    'use strict';
    var trajectoryView = BaseView.extend({
        className: 'map',
        id: 'map',
        spillToggle: false,
        spillCoords: [],
        state: 'pause',
        frame: 0,
        contracted: false,
        styles: {
            ice: {
                coverage: function(feature, resolution){
                    var cov = feature.get('coverage');
                    var alpha = parseFloat(cov);
                    return [new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(36, 36, 227,' + alpha + ')'
                        })
                    })];
                },
                thickness: function(feature, resolution){
                    var thick = feature.get('thickness');
                    var alpha = thick / 5;
                    return [new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(36, 36, 227,' + alpha + ')'
                        })
                    })];
                }
            },
            ice_grid: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [36, 36, 227, 0.75],
                    width: 1
                })
            }),
            elements: function(feature, resolution){
                // TODO: should use a cache for generated styles.
                // total of 4 unique styles can be returned.
                // red "x" | black "x" | red "o" | black "o"

                var color = 'rgba(0, 0, 0, 1)';
                if(feature.get('sc_type') === 'uncertain'){
                    color = 'rgba(255, 54, 54, 1)';
                }

                var style;
                if(feature.get('status_code') === 3){
                    // 3 = on land
                    // x
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: new ol.style.Fill({
                                color: color
                            }),
                            stroke: new ol.style.Stroke({
                                color: color,
                                width: 2
                            }),
                            points: 4,
                            radius: 4,
                            radius2: 0,
                            angle: Math.PI / 4
                        })
                    });
                } else {
                    // everything else should be visualized as a dot.
                    // o
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: 'rgba(0, 0, 0, .75)'
                            }),
                            radius: 1,
                            stroke: new ol.style.Stroke({
                                color: color
                            })
                        })
                    });
                }

                return [style];
            },
            spill: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1.0],
                    src: '/img/spill-pin.png',
                    size: [32, 40]
                }),
                stroke: new ol.style.Stroke({
                    color: '#3399CC',
                    width: 1.25
                })
            }),
            shoreline: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [228, 195, 140, 0.6]
                }),
                stroke: new ol.style.Stroke({
                    color: [228, 195, 140, 0.75],
                    width: 1
                })
            }),
            currents: function(feature, resolution){
                // the only thing we can cache for styles right now is the 0,0 vectors
                // every other style has the lat lon geometry tied to it causing
                // the style for the point to render positioned where the first feature with that 
                // uv data
                if(!_.has(webgnome.styleCache, 'currents')){
                    webgnome.styleCache.currents = {};
                    webgnome.styleCache.currents['0,0'] = new ol.style.Style({
                        image: new ol.style.Circle({
                            stroke: new ol.style.Stroke({
                                color: [171, 37, 184, 0.75],
                                width: 1
                            }),
                            radius: 1
                        })
                    });
                }

                var features = feature.get('features');

                var v_x = 0;
                var v_y = 0;
                for(var i = 0; i < features.length; i++){
                    var f = features[i];
                    var velocity = f.get('velocity');

                    v_x += velocity[0];
                    v_y += velocity[1];
                }

                v_x = v_x / features.length;
                v_y = v_y / features.length;

                var scale_factor = 50 * resolution;
                var coords = feature.getGeometry().getCoordinates();
                var shifted = [(v_x * scale_factor) + coords[0], (v_y * scale_factor) + coords[1]];

                // find the angle between the two points
                var x = shifted[0] - coords[0];
                var y = shifted[1] - coords[1];

                if(_.has(webgnome.styleCache.currents, v_x + ',' + v_y)){
                    return [webgnome.styleCache.currents[v_x+','+v_y]];
                }

                var geom;
                var width;
                var rad;

                if(x === 0){
                    rad = Math.PI / 2;
                } else {
                    rad = Math.atan(Math.abs(y/x));
                }

                if(x < 0 && y >= 0){
                    rad = Math.PI - rad;
                } else if(x < 0 && y < 0){
                    rad = Math.PI + rad;
                } else if(x >= 0 && y < 0){
                    rad = (2 * Math.PI) - rad;
                }

                var len = Math.sqrt((x * x) + (y * y));
                len = Math.abs(len / Math.log(len)) * -2;

                var rad_right = 0.785398163; //3.92699082;
                var rad_left = 0.785398163;
                            
                var arr_left;
                var arr_right;

                arr_left = rad - rad_left;
                arr_left = [(x + len * Math.cos(arr_left)) + coords[0], (y + len * Math.sin(arr_left)) + coords[1]];
                arr_right = rad + rad_right;
                arr_right = [(x + len * Math.cos(arr_right)) + coords[0] , (y + len * Math.sin(arr_right)) + coords[1]];

                geom = new ol.geom.LineString([coords, shifted, arr_left, shifted, arr_right]);
                width = 2;
                var style = new ol.style.Style({
                    geometry: geom,
                    stroke: new ol.style.Stroke({
                        color: [171, 37, 184, 0.75],
                        width: width
                    })
                });

                return [style];
            },
            currents_grid: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [171, 37, 184, 0.75],
                    width: 1
                })
            })
        },

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
            'click .current-grid input': 'toggleCurrentGrid',
            'click .current-uv input': 'toggleUV',
            'click .ice-uv input': 'toggleUV',
            'click .ice-grid input[type="checkbox"]': 'toggleIceGrid',
            'click .ice-tc input[type="checkbox"]': 'toggleIceTC',
            'click .ice-tc input[type="radio"]': 'toggleIceData'
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
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

            this.ol = new OlMapView({
                controls: 'full',
                renderer: 'canvas',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        name: 'mapquest',
                        type: 'base',
                        visible: false
                    }),
                    new ol.layer.Tile({
                        name: 'usgs',
                        source: new ol.source.TileWMS({
                            url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                            params: {'LAYERS': '0', 'TILED': true}
                        }),
                        visible: false,
                        type: 'base'
                    }),
                    new ol.layer.Tile({
                        name: 'noaanavcharts',
                        source: new ol.source.TileWMS({
                            url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                            params: {'LAYERS': '1', 'TILED': true}
                        }),
                        opacity: 0.5,
                        visible: false
                    })
                ]
            });

            this.SpillIndexSource = new ol.source.Vector();
            this.SpillIndexLayer = new ol.layer.Image({
                name: 'spills',
                source: new ol.source.ImageVector({
                    source: this.SpillIndexSource,
                    style: this.styles.spill
                }),
            });

            this.SpillLayer = new ol.layer.Vector({
                name:'spills',
                style: this.styles.elements
            });

            this.CurrentLayer = new ol.layer.Vector({
                name: 'currents',
                style: this.styles.currents
            });

            this.IceLayer = new ol.layer.Image();
            
            this.graticule = new ol.Graticule({
                maxLines: 50,
            });

            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            } else {
                date = moment().format('M/DD/YYYY HH:mm');
            }

            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing
            if(_.isUndefined(this.ol.map) && this.ol.redraw === false || this.ol.redraw){
                var currents = webgnome.model.get('movers').filter(function(mover){
                    return mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover' || mover.get('obj_type') === 'gnome.movers.current_movers.GridCurrentMover';
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
                var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'});
                var tc_ice = [];
                if(ice_tc_outputter.get('on')){
                    ice_tc_outputter.get('ice_movers').forEach(function(mover){
                        tc_ice.push(mover.get('id'));
                    });
                }
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

                this.controls.seek.slider();
                this.load();
            }

            this.contextualize();

            if(localStorage.getItem('advanced') === 'true'){
                this.toggle();
            }

            // add a 250ms timeout to the map render to give js time to add the compiled
            // to the dom before trying to draw the map.
            setTimeout(_.bind(this.renderMap, this), 250);
        },

        renderMap: function(){
            // check if the model has a map, specifically a bna map that has a TrajectorygeojsonOutput output
            // if it does load it's TrajectorygeojsonOutput and put it in a layer on the map
            // named modelmap
            if (['gnome.map.MapFromBNA', 'gnome.map.ParamMap'].indexOf(webgnome.model.get('map').get('obj_type')) !== -1) {
                webgnome.model.get('map').getGeoJSON(_.bind(function(geojson){
                    // the map isn't rendered yet, so draw it before adding the layer.
                    // but don't draw it agian for a normal render if the map is undefined redraw it.
                    if(this.ol.redraw || _.isUndefined(this.ol.map) && this.ol.redraw === false){
                        this.ol.render();
                        this.shorelineSource = new ol.source.Vector({
                            features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'}),
                        });

                        this.shorelineLayer = new ol.layer.Image({
                            name: 'modelmap',
                            source: new ol.source.ImageVector({
                                source: this.shorelineSource,
                                style: this.styles.shoreline
                            }),
                        });

                        if(this.ol.map){
                            this.ol.map.addLayer(this.shorelineLayer);
                            this.ol.setMapOrientation();
                        }

                        this.graticule.setMap(this.ol.map);
                        this.ol.map.addLayer(this.CurrentLayer);
                        this.ol.map.addLayer(this.IceLayer);
                        this.ol.map.addLayer(this.SpillIndexLayer);
                        this.ol.map.addLayer(this.SpillLayer);

                        // this.ol.map.on('pointermove', this.spillHover, this);
                        // this.ol.map.on('click', this.spillClick, this);
                    }
                    if(this.ol.redraw === false){
                        this.renderSpills();
                    }
                }, this));
            } else {
                // if the model doens't have a renderable map yet just render the base layer
                if(webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap'){
                    if(this.ol.redraw || _.isUndefined(this.ol.map) && this.ol.redraw === false){
                        this.ol.render();
                        this.graticule.setMap(this.ol.map);
                        this.ol.map.addLayer(this.SpillIndexLayer);
                        this.ol.map.addLayer(this.SpillLayer);
                        // this.ol.map.on('pointermove', this.spillHover, this);
                        // this.ol.map.on('click', this.spillClick, this);
                    }
                    if(this.ol.redraw === false){
                        this.renderSpills();
                    }
                }
            }
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
                if (webgnome.cache.at(this.controls.seek.slider('value'))){
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
            if($('.modal').length === 0){
                this.state = 'play';
                this.controls.play.addClass('pause').removeClass('play');
                this.loop();
            }
        },

        pause: function(){
            if($('.modal').length === 0){
                this.state = 'pause';
                this.controls.play.addClass('play').removeClass('pause');
                // this.controls.progress.removeClass('active progress-bar-striped');
            }
        },

        rewind: function(){
            this.pause();
            this.controls.seek.slider('value', 0);
            this.controls.progress.css('width', 0);
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
            this.renderCurrent(step);
            this.renderIce(step);

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
            var traj_source = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(step.get('TrajectoryGeoJsonOutput').feature_collection,  {featureProjection: 'EPSG:3857'}),
                useSpatialIndex: false
            });
            this.SpillLayer.setSource(traj_source);
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

            this.CurrentLayer.setSource(cur_cluster);
        },

        renderIce: function(step){
            var ice_features = [];
            var ice_data = this.$('input[name=ice_data]:checked').val();

            if(step && step.get('IceGeoJsonOutput') && this.tc_ice && this.tc_ice.length > 0){
                var ice = step.get('IceGeoJsonOutput').feature_collections;
                for(var t = 0; t < this.tc_ice.length; t++){
                    var id = this.tc_ice[t];
                    if(_.has(ice, id)){
                        var features;
                        if(ice_data === 'thickness'){
                            features = ice[id][1].features;
                        } else {
                            features = ice[id][0].features;
                        }
                        for(var r = 0; r < features.length; r++){
                            var coords = features[r].geometry.coordinates;
                            var poly = new ol.geom.MultiPolygon([coords]);
                            poly.transform('EPSG:4326', 'EPSG:3857');
                            var properties = {
                                geometry: poly
                            };
                            properties[ice_data] = features[r].properties[ice_data];
                            
                            var f = new ol.Feature(properties);
                            ice_features.push(f);
                        }
                    }
                }
            }
            var ice_source = new ol.source.Vector({
                features: ice_features,
                useSpatialIndex: false
            });

            var ice_image = new ol.source.ImageVector({
                source: ice_source,
                style: this.styles.ice[ice_data]
            });

            this.IceLayer.setSource(ice_image);
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

        toggleCurrentGrid: function(e){
            var currents = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover';
            });
            var id = this.$(e.currentTarget).attr('id');
            var checked = this.$(e.currentTarget).is(':checked');
            var gridLayer;

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('id') === id){
                    gridLayer = layer;
                }
            });
            
            if (_.isUndefined(gridLayer) && id !== 'none-grid'){
                var current = webgnome.model.get('movers').findWhere({id: id.replace('grid-', '')});
                current.getGrid(_.bind(function(geojson){
                    if (geojson){
                        var gridSource = new ol.source.Vector({
                            useSpatialIndex: false,
                            features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'})
                        });

                        gridLayer = new ol.layer.Image({
                            id: id,
                            type: 'grid',
                            source: new ol.source.ImageVector({
                                source: gridSource,
                                style: this.styles.currents_grid
                            })
                        });
                        this.ol.map.getLayers().insertAt(3, gridLayer);
                    }
                }, this));
            } 

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('id') === id && layer.get('type') === 'grid'){
                    layer.setVisible(true);
                } else if(layer.get('id') !== id && layer.get('type') === 'grid' || id === 'none-grid' && layer.get('type') === 'grid'){
                    layer.setVisible(false);
                }
            });
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

        toggleIceGrid: function(e){
            var currents = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.IceMover';
            });
            var id = this.$(e.currentTarget).attr('id');
            var checked = this.$(e.currentTarget).is(':checked');
            var gridLayer;

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('id') === id){
                    gridLayer = layer;
                }
            });
            
            if (_.isUndefined(gridLayer)){
                var current = webgnome.model.get('movers').findWhere({id: id.replace('grid-', '')});
                current.getGrid(_.bind(function(geojson){
                    if (geojson){
                        var gridSource = new ol.source.Vector({
                            useSpatialIndex: false,
                            features: (new ol.format.GeoJSON()).readFeatures(geojson, {featureProjection: 'EPSG:3857'})
                        });

                        gridLayer = new ol.layer.Image({
                            id: id,
                            source: new ol.source.ImageVector({
                                source: gridSource,
                                style: this.styles.ice_grid
                            })
                        });
                        this.ol.map.getLayers().insertAt(3, gridLayer);
                    }
                }, this));
            } else if (!checked && !_.isUndefined(gridLayer)) {
                this.ol.map.getLayers().forEach(_.bind(function(layer){
                    if (layer.get('id') === id){
                        layer.setVisible(false);
                    }
                }, this));
            } else {
                this.ol.map.getLayers().forEach(function(layer){
                    if (layer.get('id') === id){
                        layer.setVisible(true);
                    }
                });
            }
        },

        toggleIceTC: function(e){
            var checked = this.$('.ice-tc input:checked');
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'});

            if (checked.length > 0){
                current_outputter.get('ice_movers').reset();
                this.tc_ice = [];

                this.$('.ice-tc input:checked').each(_.bind(function(i, input){
                    var id = input.id.replace('tc-', '');
                    var current = webgnome.model.get('movers').get(id);
                    this.tc_ice.push(id);
                    current_outputter.get('ice_movers').add(current);
                }, this));
            } else {
                current_outputter.get('ice_movers').reset();
                this.tc_ice = [];
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
            this.ol.close();
        }
    });

    return trajectoryView;
});