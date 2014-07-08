define([
    'jquery',
    'underscore',
    'backbone',
    'ol'
], function($, _, Backbone, ol){
    var olMapView = Backbone.View.extend({
        className: 'map',
        id:'map',
        interactions: ol.interaction.defaults(),
        controls: ol.control.defaults().extend([
            new ol.control.MousePosition({
                coordinateFormat: function(coordinates){
                    if(coordinates){
                        var coords = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
                        return 'Lat: ' + Math.round(coords[1] * 100) / 100 + ' Lng: ' + Math.round(coords[0] * 100) / 100;
                    }
                },
                undefinedHTML: 'Mouse out of bounds'
            })
        ]),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'osm'})
            })
        ],
        center: [-99.6, 40.6],
        overlays: [],
        zoom: 3.5,


        initialize: function(options){
            if(!_.isUndefined(options)){
                if(!_.isUndefined(options.id)){
                    this.id = options.id;
                }

                if(!_.isUndefined(options.controls)){
                    if(options.controls === 'full'){
                        ol.control.defaults().extend([
                            new ol.control.MeasureRuler(),
                            //new ol.control.MeasureArea(),
                            new ol.control.MousePosition({
                                coordinateFormat: function(coordinates){
                                    if(coordinates){
                                        var coords = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
                                        return 'Lat: ' + Math.round(coords[1] * 100) / 100 + ' Lng: ' + Math.round(coords[0] * 100) / 100;
                                    }
                                },
                                undefinedHTML: 'Mouse out of bounds'
                            })
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
            }
        },

        render: function(){
            this.map = new ol.Map({
                interactions: this.interactions,
                controls: this.controls,
                target: this.id,
                layers: this.layers,
                view: new ol.View2D({
                    center: ol.proj.transform(this.center, 'EPSG:4326', 'EPSG:3857'),
                    zoom: this.zoom,
                    extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
                })
            });
        }
    });

    return olMapView;
});