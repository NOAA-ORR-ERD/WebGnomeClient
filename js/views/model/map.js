define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'ol',
    'model/spill',
    'views/form/spill',
    'model/step',
    'mousetrap',
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, moment, ControlsTemplate, olMapView, ol, GnomeSpill, SpillForm, GnomeStep, Mousetrap){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',
        spillToggle: false,
        state: 'pause',
        step: new GnomeStep(),
        frame: 0,

        events: {
            'click .spill-button': 'toggleSpill',
            'mouseout .spill-button': 'toggleSpillBlur',
            'focusout .spill-button': 'toggleSpillBlur',
            'click .play': 'play',
            'click .pause': 'pause',
            'click .next': 'next',
            'click .rewind': 'rewind',
            'slide .seek > div': 'seek',
            'slidechange .seek > div': 'loop',
            'slidestop .seek > div': 'blur'
        },

        initialize: function(){
            webgnome.model.on('ready', this.modelListeners, this);
            
            if(webgnome.model.ready){
                this.render();
                this.modelListeners();
            } else {
                webgnome.model.once('ready', this.render, this);
            }
        },

        modelListeners: function(){
            webgnome.model.get('map').on('change', this.resetMap, this);
            webgnome.model.get('spills').on('add', this.resetSpills, this);
            webgnome.model.get('spills').on('remove', this.resetSpills, this);
            webgnome.model.on('change', this.contextualize, this);
        },

        render: function(){
            this.ol = new olMapView({
                controls: 'full',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        name: 'basemap'
                    })
                ]
            });

            this.SpillIndexSource = new ol.source.Vector();
            this.SpillIndexLayer = new ol.layer.Vector({
                source: this.SpillIndexSource,
                name: 'spills',
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1.0],
                        src: '/img/spill-pin.png',
                        size: [32, 40]
                    })
                })
            });

            this.SpillGroupLayers = new ol.Collection();
            this.SpillGroupLayer = new ol.layer.Group({
                name:'spills',
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 0, .75)'
                        }),
                        radius: 1,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 1)'
                        })
                    })
                }),
                layers: this.SpillGroupLayers
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

            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing
            if(_.isUndefined(this.ol.map) && this.ol.redraw === false || this.ol.redraw){
                var compiled = _.template(ControlsTemplate, {date: date});
                this.$el.html(compiled);
                this.$('.layers .title').click(_.bind(function(){
                    this.$('.layers').toggleClass('expanded');
                }, this));
                this.$('.layers input[type="checkbox"]').click(_.bind(this.toggleLayer, this));
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
            }

            this.contextualize();
            
            // add a 250ms timeout to the map render to give js time to add the compiled
            // to the dom before trying to draw the map.
            setTimeout(_.bind(this.renderMap, this), 250);
        },

        contextualize: function(){
            if(!webgnome.hasModel() || !webgnome.validModel()){
                this.disableUI();
            } else {
                this.enableUI();
            }

            // set the slider to the correct number of steps
            this.controls.seek.slider('option', 'max', webgnome.model.get('num_time_steps') - 1);
            this.SpillGroupLayers.clear();
            this.rewind();
        },

        loop: function(){
            if(this.state == 'play' && this.frame < webgnome.model.get('num_time_steps') - 1){
                if(this.SpillGroupLayers.item(this.controls.seek.slider('value'))){
                    // the step already exists in the index, make it visible.
                    this.SpillGroupLayers.item(this.controls.seek.slider('value')).once('render', _.bind(function(){
                        setTimeout(_.bind(function(){
                            this.controls.seek.slider('value', this.controls.seek.slider('value') + 1);
                        }, this), 60);
                    }, this));
                    this.renderStep({step: this.controls.seek.slider('value')});

                } else if (this.controls.seek.slider('value') < webgnome.model.get('num_time_steps')){
                    // the step doesn't already exist on the map and it's with in the number of 
                    // time steps this model should have so load

                    this.controls.progress.addClass('active').addClass('progress-bar-striped');
                    var percent = Math.round(((this.frame + 1) / (webgnome.model.get('num_time_steps') - 1)) * 100);
                    this.controls.progress.css('width', percent + '%');
                    this.step.fetch({
                        success: _.bind(this.renderStep, this),
                        error: _.bind(function(){
                            this.pause();
                            console.log('error loading step');
                        }, this)
                    });
                } else {
                    this.pause();
                    this.controls.progress.removeClass('active').removeClass('progress-bar-striped');
                }
            } else {
                this.controls.progress.removeClass('active').removeClass('progress-bar-striped');
            }
        },

        togglePlay: function(){
            if (this.state == 'play') {
                this.pause();
            } else {
                this.play();
            }
        },

        play: function(){
            this.state = 'play';
            this.controls.play.addClass('pause').removeClass('play');
            this.loop();
        },

        pause: function(){
            this.state = 'pause';
            this.controls.play.addClass('play').removeClass('pause');
        },

        rewind: function(){
            this.pause();
            this.controls.seek.slider('value', 0);
            this.controls.progress.css('width', 0);
            this.frame = 0;
            $.get(webgnome.api + '/rewind');

            // clean up the spill ... ha
            this.SpillGroupLayers.clear();
        },

        prev: function(){
            this.pause();
            this.controls.seek.slider('value', this.frame - 1);
            this.renderStep({step: this.frame - 1});
        },

        next: function(){
            this.pause();
            if(this.SpillGroupLayers.item(this.frame + 1)){
                this.controls.seek.slider('value', this.frame + 1);
                this.renderStep({step: this.frame + 1});
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

        renderStep: function(options){
            if(!_.isUndefined(options.step)) {
                // if the map has the requested frame render it while seeking
                if(this.SpillGroupLayers.item(options.step)){
                    this.SpillGroupLayers.item(this.frame).setVisible(false);
                    this.SpillGroupLayers.item(options.step).setVisible(true);
                    this.frame = options.step;
                    this.controls.date.text(this.SpillGroupLayers.item(this.frame).get('ts'));
                } else {
                    if(this.state == 'seek'){
                        // map doesn't have the requested frame layer
                        // if the user drops it outside the loaded range reset it.
                        this.controls.seek.one('slidestop', _.bind(this.resetSeek, this));
                    }
                }
            } else if(this.step.get('GeoJson')){
                this.getStepLayer();
            }
        },

        getStepLayer: function(){
            var layer = new ol.layer.Vector({
                step: this.step.get('GeoJson').step_num,
                ts: moment(this.step.get('GeoJson').time_stamp, 'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY HH:mm'),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 0, .75)'
                        }),
                        radius: 1,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 1)'
                        })
                    })
                }),
                source: new ol.source.GeoJSON({
                    // url: ''
                    projection: 'EPSG:3857',
                    object: this.step.get('GeoJson').feature_collection
                })
            });
        
            layer.once('render', _.bind(function(){
                if(this.step.get('GeoJson').step_num > 0){
                    this.SpillGroupLayers.item(this.step.get('GeoJson').step_num - 1).setVisible(false);
                    this.frame = this.step.get('GeoJson').step_num;
                    this.controls.date.text(this.SpillGroupLayers.item(this.frame).get('ts'));
                }
                if(this.frame < webgnome.model.get('num_time_steps') && this.state == 'play'){
                    this.controls.seek.slider('value', this.frame + 1);
                } else {
                    this.pause();
                    this.controls.progress.removeClass('active').removeClass('progress-bar-striped');
                }
            }, this));
            
            this.SpillGroupLayers.push(layer);
        },

        disableUI: function(){
            // visually disable the interface and remove listeners
            this.controls.seek.slider('option', 'disabled', true);
            this.$('.buttons a').addClass('disabled');
            Mousetrap.unbind('space', _.bind(this.togglePlay, this));
        },

        enableUI: function(){
            // visusally enable the interface and add listeners
            this.controls.seek.slider('option', 'disabled', false);
            this.$('.buttons a').removeClass('disabled');
            Mousetrap.bind('space', _.bind(this.togglePlay, this));
            Mousetrap.bind('right', _.bind(this.next, this));
            Mousetrap.bind('left', _.bind(this.prev, this));
        },

        toggle: function(offset){
            offset = typeof offset !== 'undefined' ? offset : 0;

            if(this.full){
                this.full = false;
                this.$el.css({width: this.width, paddingLeft: 0});
            } else{
                this.full = true;
                this.$el.css({width: '100%', paddingLeft: offset});
            }
            this.ol.map.updateSize();
        },

        renderMap: function(){
            // check if the model has a map, specifically a bna map that has a geojson output
            // if it does load it's geojson and put it in a layer on the map
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
                        this.shorelineLayer = new ol.layer.Vector({
                            source: this.shorelineSource,
                            name: 'modelmap',
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

                        var extent = this.shorelineSource.getExtent();
                        if(this.ol.map){
                            this.ol.map.addLayer(this.shorelineLayer);
                            this.ol.map.getView().fitExtent(extent, this.ol.map.getSize());
                        }

                        this.graticule.setMap(this.ol.map);
                        this.ol.map.addLayer(this.SpillGroupLayer);
                        this.ol.map.addLayer(this.SpillIndexLayer);
                    }
                    if(this.ol.redraw === false){
                        this.renderSpills();
                    }
                }, this));
            } else {
                // if the model doens't have a renderable map yet just render the base layer
                if(webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap'){
                    this.ol.render();
                    this.graticule.setMap(this.ol.map);
                    this.ol.map.addLayer(this.SpillIndexLayer);
                    this.ol.map.addLayer(this.SpillGroupLayer);
                    this.ol.map.render();
                    this.resetSpills();
                }
            }
        },

        toggleLayer: function(event){
            var layer = event.target.id;

            if(layer){
                this.ol.map.getLayers().forEach(function(el){
                    if(el.get('name') == layer){
                        if(el.getVisible()){
                            el.setVisible(false);
                        } else {
                            el.setVisible(true);
                        }
                    }
                });
            }
        },

        toggleSpill: function(){
            if(this.spillToggle){
                this.ol.map.getViewport().style.cursor = '';
                this.spillToggle = false;
                this.ol.map.un('click', this.addSpill, this);
            } else {
                this.ol.map.getViewport().style.cursor = 'crosshair';
                this.spillToggle = true;
                this.ol.map.on('click', this.addSpill, this);
            }

            this.$('.spill-button').toggleClass('on');
        },

        toggleSpillBlur: function(event){
            event.target.blur();
        },

        renderSpills: function(){
            // foreach spill add at feature to the source
            spills = webgnome.model.get('spills');
            spills.forEach(function(spill){
                var start_position = spill.get('release').get('start_position');
                if(start_position.length > 2){
                    start_position = [start_position[0], start_position[1]];
                }
                var geom = new ol.geom.Point(ol.proj.transform(start_position, 'EPSG:4326', this.ol.map.getView().getProjection()));
                var feature = new ol.Feature({
                    geometry: geom,
                    spill: spill
                });

                this.SpillIndexSource.addFeature(feature);
            }, this);

            this.ol.map.on('pointermove', this.spillHover, this);
            this.ol.map.on('click', this.spillClick, this);
        },

        resetSpills: function(){
            // remove all spills from the source.
            this.SpillIndexSource.clear();
            this.renderSpills();
        },

        addSpill: function(e){
            // add a spill to the model.
            var coord = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
            var spill = new GnomeSpill();
            // add the dummy z-index thing
            coord.push(0);
            spill.get('release').set('start_position', coord);
            spill.get('release').set('end_position', coord);
            spill.get('release').set('release_time', webgnome.model.get('start_time'));
            spill.get('release').set('end_release_time', webgnome.model.get('start_time'));

            spill.save(null, {
                validate: false,
                success: function(){
                    var spillform = new SpillForm(null, spill);
                    spillform.render();
                    spillform.on('save', function(){
                        webgnome.model.get('spills').add(spill);
                        webgnome.model.save();
                    });
                }
            });

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
                new SpillForm(null, spill).render();
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
            this.remove();
            this.unbind();
            this.ol.close();
        }
    });

    return mapView;
});