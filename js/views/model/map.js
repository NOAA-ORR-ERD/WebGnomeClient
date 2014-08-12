define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'ol',
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, moment, ControlsTemplate, olMapView, ol){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',

        initialize: function(){
            this.graticule = new ol.Graticule({
                maxLines: 50,
            });
            this.render();
            
            webgnome.model.on('ready', this.render, this);
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
            webgnome.model.get('map').on('change', this.resetMap, this);

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
                    }
                }, this));
            } else {
                // if the model doens't have a renderable map yet just render the base layer
                if(webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap'){
                    this.ol.render();
                    this.graticule.setMap(this.ol.map);
                }
            }
        },

        toggleLayer: function(event){
            var layer = event.target.id;

            if(layer){
                this.ol.map.getLayers().forEach(function(el, ind, ar){
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