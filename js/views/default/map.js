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
                    source: new ol.source.MapQuest({layer: 'osm'}),
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
            if(!_.isUndefined(options)){
                if(!_.isUndefined(options.id)){
                    this.id = options.id;
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

                if(!_.isUndefined(options.layers)){
                    this.layers = options.layers;
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
            this.redraw = false;
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