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
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, moment, ControlsTemplate, olMapView, ol, GnomeSpill, SpillForm){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',
        spillToggle: false,

        events: {
            'click .spill-button': 'toggleSpill',
            'mouseout .spill-button': 'toggleSpillBlur',
            'focusout .spill-button': 'toggleSpillBlur'
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
            
            this.graticule = new ol.Graticule({
                maxLines: 50,
            });

            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:MM');
            } else {
                date = moment().format('M/DD/YYYY HH:MM');
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

                this.$('.seek > div').slider();
            }
            
            // check if the ui should be functional
            if(!webgnome.hasModel() || !webgnome.validModel()){
                this.$('.seek > div').slider('option', 'disabled', true);
                this.$('.buttons a').addClass('disabled');
            }
            // add a 250ms timeout to the map render to give js time to add the compiled
            // to the dom before trying to draw the map.
            setTimeout(_.bind(this.renderMap, this), 250);
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
            spill.get('release').set('release_time', webgnome.model.get('start_time'));
            spill.get('release').set('end_release_time', moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's').format('YYYY-MM-DDTHH:mm:ss'));

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

        close: function(){
            this.remove();
            this.unbind();
            this.ol.close();
        }
    });

    return mapView;
});