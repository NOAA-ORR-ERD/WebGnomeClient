define([
    'jquery',
    'underscore',
    'backbone',
    'ol'
], function($, _, Backbone, ol){
    'use strict';
    var olMapView = Backbone.View.extend({
        className: 'map',
        id:'map',

        defaults: function(){
            this.redraw = false;
            this.interactions = ol.interaction.defaults();
            this.controls = ol.control.defaults().extend([
                new ol.control.MousePosition({
                    coordinateFormat: function(coordinates){
                        if(coordinates){
                            var coords = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
                            return 'Lat: ' + Math.round(coords[1] * 100) / 100 + ' Lng: ' + Math.round(coords[0] * 100) / 100;
                        }
                    },
                    undefinedHTML: 'Mouse out of bounds'
                }),
                new ol.control.ScaleLine()
            ]);
            this.layers = [
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                params: {'LAYERS': '0', 'TILED': true}
                            }),
                    name: 'basemap'
                })
            ];
            this.center = ol.proj.transform([-99.6, 40.6], 'EPSG:4326', 'EPSG:3857');
            this.overlays = [];
            this.extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];
            this.zoom = 10;
            this.renderer = 'canvas';
        },

        initialize: function(options){
            this.defaults();
            if (options.trajectory) {
                    this.trajectory = options.trajectory;
                    this.layers = [
                        new ol.layer.Image({
                            name: 'noaanavcharts',
                            source: new ol.source.ImageWMS({
                                url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/ImageServer/WMSServer',
                                params: {'LAYERS': '1'}
                            }),
                            opacity: 0.5,
                            visible: true
                        }),
                        new ol.layer.Tile({
                            name: 'usgs',
                            source: new ol.source.TileWMS({
                                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                params: {'LAYERS': '0', 'TILED': true}
                            }),
                            visible: false,
                            type: 'base'
                        })
                    ];
                    this.styles = {
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
                        })
                    };
            }
            if(!_.isUndefined(options)){
                if(!_.isUndefined(options.id)){
                    this.id = options.id;
                } else {
                    this.id = this.$el[0];
                }

                if(!_.isUndefined(options.controls)){
                    if(options.controls === 'full'){
                        this.controls = ol.control.defaults().extend([
                            new ol.control.MeasureRuler(),
                            new ol.control.MeasureArea(),
                            new ol.control.MousePosition({
                                coordinateFormat: function(coordinates){
                                    if(coordinates){
                                        var coords = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
                                        return 'Lat: ' + Math.round(coords[1] * 100) / 100 + ' Lng: ' + Math.round(coords[0] * 100) / 100;
                                    }
                                },
                                undefinedHTML: 'Mouse out of bounds'
                            }),
                            new ol.control.ScaleLine()
                        ]);
                    } else {
                        this.controls = options.controls;
                    }
                }

                if(!_.isUndefined(options.layers) && !options.trajectory){
                    this.layers = options.layers;
                } else {
                    this.layers = this.layers.concat(options.layers);
                }

                if(!_.isUndefined(options.interactions)){
                    this.interactions = options.interactions;
                }

                if(!_.isUndefined(options.center)){
                    this.center = options.center;
                }

                if(!_.isUndefined(options.center)){
                    this.overlays = options.overlays;
                }

                if(!_.isUndefined(options.zoom)){
                    this.zoom = options.zoom;
                }

                if(!_.isUndefined(options.extent)){
                    this.extent = options.extent;
                }

                if(!_.isUndefined(options.renderer)){
                    this.renderer = options.renderer;
                }
                   
            }
        },

        trajectoryRender: function() {
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

            var spill_coords = webgnome.model.get('map').get('spillable_area');
            var spill_feature = new ol.Feature({
                geometry: new ol.geom.MultiPolygon([spill_coords]).transform('EPSG:4326', 'EPSG:3857')
            });
            this.spillableAreaSource = new ol.source.Vector({
                features: [spill_feature]
            });

            this.SpillableArea = new ol.layer.Image({
                name: 'spillableArea',
                source: new ol.source.ImageVector({
                    source: this.spillableAreaSource,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: [175, 224, 230, 0.1]
                        }),
                        stroke: new ol.style.Stroke({
                            color: [65, 105, 225, 0.75],
                            width: 1
                        })
                    })
                }),
                visible: false
            });

            var map = webgnome.model.get('map');
            if (!_.isUndefined(map) && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                map.getGeoJSON(_.bind(function(data){
                    this.shorelineSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(data, {featureProjection: 'EPSG:3857'})
                    });
                    this.shorelineLayer = new ol.layer.Vector({
                        name: 'shoreline',
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
                    });
                    if(this.map){
                        this.map.getLayers().insertAt(1, this.shorelineLayer);
                        //this.map.addLayer(this.shorelineLayer);
                        this.setMapOrientation();
                    }
                }, this));
            }
            
            this.addLayers();
            this.map.getLayers().forEach(function(layer){
                if (layer.get('type') !== 'base') {
                    layer.setVisible(true);
                }
            });
        },

        addLayers: function() {
            this.map.addLayer(this.SpillableArea);
            this.map.addLayer(this.SpillIndexLayer);
            this.map.addLayer(this.SpillLayer);
        },

        render: function(){
            this.map = new ol.Map({
                interactions: this.interactions,
                controls: this.controls,
                target: this.id,
                renderer: this.renderer,
                layers: this.layers,
                view: new ol.View({
                    center: this.center,
                    zoom: this.zoom,
                    zoomFactor: 1.25,
                    extent: this.extent
                })
            });

            if(_.isNaN(this.map.getSize()[0])){
                // the map was told to render but for some reason there isn't a physical size to it.
                // so we're going to start a loop to check if it has a physical size with an increasing
                // timeout
                this.timeout = 100;
                this.delayedRender();
            }

            this.redraw = false;

            if (this.trajectory) {
                this.trajectoryRender();
            }
        },

        close: function(){
            if (this.map) {
                this.map.setTarget(null);
                this.map = null;
            }
            
            Backbone.View.prototype.close.call(this);
        },

        delayedRender: function(){
            setTimeout(_.bind(function(){
                this.map.updateSize();
                if(_.isNaN(this.map.getSize()[0]) && this.timeout < 2500){
                    this.timeout = this.timeout * 5;
                    this.delayedRender();
                }
            }, this), this.timeout);
        },

        setMapOrientation: function(){
            if (webgnome.model.get('map').get('obj_type') !== 'gnome.map.GnomeMap'){
                var extent = ol.proj.transformExtent(webgnome.model.get('map').getExtent(), 'EPSG:4326', 'EPSG:3857');
                this.map.getView().fit(extent, this.map.getSize());
            }
        }
    });

    return olMapView;
});