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
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, BaseView, module, moment, ControlsTemplate, olMapView, ol, GnomeSpill, SpillForm, GnomeStep, Mousetrap){
    var trajectoryView = BaseView.extend({
        className: 'map',
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
            'click .rewind': 'rewind',
            'slide .seek > div': 'seek',
            'slidechange .seek > div': 'loop',
            'slidestop .seek > div': 'blur',
            'click .layers label': 'toggleLayers',
            'click .currents': 'toggleCurrents'
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                this.modelListeners();
            }

            this.render();
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

            this.ol = new olMapView({
                controls: 'full',
                renderer: 'webgl',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        name: 'mapquest',
                        type: 'base',
                        visible: false
                    }),
                    new ol.layer.Tile({
                        name: 'usgsbase',
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
                    style: new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1.0],
                            src: '/img/spill-pin.png',
                            size: [32, 40]
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 1.25
                        })
                    })
                }),
            });

            this.SpillLayer = new ol.layer.Vector({
                name:'spills',
                style: function(feature, resolution){
                    var color = 'rgba(0, 0, 0, 1)';
                    if(feature.get('sc_type') == 'uncertain'){
                        color = 'rgba(255, 54, 54, 1)';
                    }
                    return [new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: 'rgba(0, 0, 0, .75)'
                            }),
                            radius: 1,
                            stroke: new ol.style.Stroke({
                                color: color
                            })
                        })
                    })];
                }
            });
            
            this.graticule = new ol.Graticule({
                maxLines: 50,
            });

            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            } else {
                date = moment().format('M/DD/YYYY HH:mm');
            }

            var currents = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover';
            });

            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing
            if(_.isUndefined(this.ol.map) && this.ol.redraw === false || this.ol.redraw){
                var compiled = _.template(ControlsTemplate, {date: date, currents: currents});
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

        toggle: function(){
            if(this.contracted === true){
                this.$el.removeClass('contracted');
                this.contracted = false;
            } else {
                this.$el.addClass('contracted');
                this.contracted = true;
            }
            
            if(this.ol.map){
                this.ol.map.updateSize();
            }
        },

        contextualize: function(){
            if(!webgnome.hasModel() || !webgnome.validModel()){
                this.disableUI();
            } else {
                this.enableUI();
            }

            // set the slider to the correct number of steps
            this.controls.seek.slider('option', 'max', webgnome.model.get('num_time_steps') - 1);
        },

        load: function(){
            this.updateProgress();
            this.play();
            webgnome.cache.on('step:recieved', this.renderStep, this);
            webgnome.cache.on('step:failed', this.pause, this);
        },

        loop: function(){
            if(this.state == 'play' && this.frame < webgnome.model.get('num_time_steps') - 1){
                if (webgnome.cache.at(this.controls.seek.slider('value'))){
                    // the cache has the step, just render it
                    this.renderStep(webgnome.cache.at(this.controls.seek.slider('value')));
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
            if (this.state == 'play') {
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
                if(webgnome.cache.at(this.frame + 1)){
                    this.controls.seek.slider('value', this.frame + 1);
                    this.renderStep({step: this.frame + 1});
                }
            }
        },

        seek: function(e, ui){
            this.pause();
            this.state = 'seek';
            this.controls.seek.slider('value', ui.value);
            this.renderStep({step: ui.value});
        },

        resetSeek: function(){
            this.controls.seek.slider('value', this.frame);
            this.state = 'pause';
        },

        renderStep: function(source){
            var step;
            if(_.has(source, 'step')){
                step = webgnome.cache.at(source.step);
            } else {
                step = source;
            }

            if(step){
                var geo_source = new ol.source.GeoJSON({
                    object: step.get('TrajectoryGeoJsonOutput').feature_collection,
                    projection: 'EPSG:3857'
                });
                this.SpillLayer.setSource(geo_source);

                this.controls.date.text(step.get('ts'));
                this.frame = step.get('TrajectoryGeoJsonOutput').step_num;
                if(this.frame < webgnome.model.get('num_time_steps') && this.state == 'play'){
                    setTimeout(_.bind(function(){
                        this.controls.seek.slider('value', this.frame + 1);
                    }, this), 60);
                } else {
                    this.pause();
                } 
            } else if (this.state == 'seek') {
                this.controls.seek.one('slidestop', _.bind(this.resetSeek, this));
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

        renderMap: function(){
            // check if the model has a map, specifically a bna map that has a TrajectorygeojsonOutput output
            // if it does load it's TrajectorygeojsonOutput and put it in a layer on the map
            // named modelmap
            if (webgnome.model.get('map').get('obj_type') === 'gnome.map.MapFromBNA') {
                webgnome.model.get('map').getGeoJSON(_.bind(function(geojson){
                    // the map isn't rendered yet, so draw it before adding the layer.
                    // but don't draw it agian for a normal render if the map is undefined redraw it.
                    if(this.ol.redraw || _.isUndefined(this.ol.map) && this.ol.redraw === false){
                        this.ol.render();
                        this.shorelineSource = new ol.source.GeoJSON({
                            object: geojson,
                            projection: 'EPSG:3857'
                        });

                        this.shorelineLayer = new ol.layer.Image({
                            name: 'modelmap',
                            source: new ol.source.ImageVector({
                                source: this.shorelineSource,
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

                        var extent = this.shorelineSource.getExtent();
                        if(this.ol.map){
                            this.ol.map.addLayer(this.shorelineLayer);
                            this.ol.map.getView().fitExtent(extent, this.ol.map.getSize());
                        }

                        this.graticule.setMap(this.ol.map);
                        this.ol.map.addLayer(this.SpillIndexLayer);
                        this.ol.map.addLayer(this.SpillLayer);

                        this.ol.map.on('pointermove', this.spillHover, this);
                        this.ol.map.on('click', this.spillClick, this);
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
                        this.ol.map.on('pointermove', this.spillHover, this);
                        this.ol.map.on('click', this.spillClick, this);
                    }
                    if(this.ol.redraw === false){
                        this.renderSpills();
                    }
                }
            }
        },

        toggleLayers: function(event){
            var checked_layers = [];
            this.$('.layers input:checked').each(function(i, input){
                checked_layers.push(input.id);
            });

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('type') === 'base'){
                    if (checked_layers.indexOf('basemap') !== -1){
                        if(checked_layers.indexOf(layer.get('name')) !== -1){
                            layer.setVisible(true);
                        } else {
                            layer.setVisible(false);
                        }
                    } else {
                        layer.setVisible(false);
                    }
                } else if (checked_layers.indexOf(layer.get('name')) !== -1){
                    layer.setVisible(true);
                } else {
                    layer.setVisible(false);
                }
            });
        },

        toggleCurrents: function(e){
            var currents = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover';
            });
            var currentId = this.$(e.currentTarget)[0].id;
            var checked = this.$(e.currentTarget).is(':checked');
            var gridLayer;
            var deletedLayer;

            this.ol.map.getLayers().forEach(function(layer){
                if (layer.get('id') === currentId){
                    gridLayer = layer;
                }
            });
            
            if (_.isUndefined(gridLayer)){
                currents[currentId - 1].getGrid(_.bind(function(geojson){
                    if (geojson){
                        var gridSource = new ol.source.GeoJSON({
                            projection: 'EPSG:3857',
                            object: geojson
                        });
                        var extentSum = gridSource.getExtent().reduce(function(prev, cur){ return prev + cur; });

                        gridLayer = new ol.layer.Image({
                            name: 'current' + currentId,
                            id: currentId,
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

                        this.ol.map.addLayer(gridLayer);
                    }
                }, this));
            } else if (!checked && !_.isUndefined(gridLayer)) {
                this.ol.map.getLayers().forEach(_.bind(function(layer){
                    if (layer.get('id') === currentId){
                        console.log('hide');
                        layer.setVisible(false);
                    }
                }, this));
            } else {
                this.ol.map.getLayers().forEach(function(layer){
                    if (layer.get('id') === currentId){
                        layer.setVisible(true);
                    }
                });
            }
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
            spills = webgnome.model.get('spills');
            spills.forEach(function(spill){
                var start_position = spill.get('release').get('start_position');
                var end_position = spill.get('release').get('end_position');
                var geom;
                if(start_position.length > 2 && start_position[0] == end_position[0] && start_position[1] == end_position[1]){
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
                    if(layer.get('name') == 'spills'){
                        return layer;
                    }
                    return false;
                });
                if (pointer) {
                    this.ol.map.getViewport().style.cursor = 'pointer';
                } else if(this.ol.map.getViewport().style.cursor == 'pointer') {
                    this.ol.map.getViewport().style.cursor = '';
                }
            }
        },

        spillClick: function(e){
            var spill = this.ol.map.forEachFeatureAtPixel(e.pixel, function(feature){
                return feature.get('spill');
            }, null, function(layer){
                if(layer.get('name') == 'spills'){
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
            webgnome.cache.off('step:recieved', this.renderStep, this);
            webgnome.cache.off('step:failed', this.pause, this);
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