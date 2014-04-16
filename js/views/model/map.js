define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/model/controls.html',
    'lib/ol-simple',
    'jqueryui'
], function($, _, Backbone, ControlsTemplate, ol){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',
        index: 0,
        step: [],

        icon_style: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, .2)'
            }),
            radius: 4,
            stroke: new ol.style.Stroke({
                color: '#0099cc'
            })
        }),

        part_icon_style: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 0, .75)'
            }),
            radius: 1,
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 1)'
            })
        }),

        events: {
            'click .play': 'play'
        },

        initialize: function(){
            this.render();
            this.$('.seek > div').slider();
        },

        render: function(){
            var date = new Date();
            date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ' ';
            var compiled = _.template(ControlsTemplate, {date: date});
            this.$el.html(compiled);
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
            webgnome.map.updateSize();
        },

        renderMap: function(){
            var icon_style = this.icon_style;
            var part_icon_style = this.part_icon_style;

            webgnome.map = new ol.Map({
                controls: ol.control.defaults().extend([
                    new ol.control.MeasureRuler(),
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
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    new ol.layer.Vector({
                        source: new ol.source.GeoJSON({
                            projection: 'EPSG:3857',
                            url: '/sw_TX_jetties.json',
                        })
                    })
                ],
                renderer: 'canvas',
                view: new ol.View2D({
                    center: ol.proj.transform([-95.7, 28.5], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 8
                })
            });
    
            // this.current_source = new ol.source.GeoJSON({
            //     projection: 'EPSG:3857',
            //     url: '/COOPSu_NGOFS-step-1.json'
            // });
    
            // this.current_layer = new ol.layer.Vector({
            //     source: this.current_source,
            //     style: function(feature, resolution){
            //         if(resolution < 250){
            //             return [new ol.style.Style({
            //                 image: icon_style
            //             })];
            //         }
            //     }
            // });

            this.spill_source = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                name: 'spill source',
                url: '/texas_particles-step-1.json'
            });

            this.spill_layer = new ol.layer.Vector({
                source: this.spill_source,
                name: 'spill',
                style: function(feature, resolution){
                    return [new ol.style.Style({
                        image: part_icon_style
                    })];
                }
            });

            this.step[0] = this.spill_layer;

            //webgnome.map.addLayer(this.current_layer);
            webgnome.map.addLayer(this.step[0]);
        },

        play: function(){
            var part_icon_style = this.part_icon_style;

            if(this.index == 48){
                this.index = -1;
                return false;
            } else if (this.index < 48) {
                this.index += 1;
            } else {
                return false;
            }
            
            if(this.step[this.index] === undefined){
                this.spill_source = new ol.source.GeoJSON({
                    projection: 'EPSG:3857',
                    url: '/texas_particles-step-' + (this.index + 1) + '.json'
                });

                this.spill_layer = new ol.layer.Vector({
                    source: this.spill_source,
                    style: function(feature, resolution){
                        return [new ol.style.Style({
                            image: part_icon_style
                        })];
                    }
                });
                this.spill_layer.once('render', function(){
                    if (this.index !== 0){
                        this.step[this.index - 1].setVisible(0);
                    } else {
                        this.step[48].setVisible(0);
                    }
                    this.play();
                }, this);
                this.step[this.index] = this.spill_layer;
                webgnome.map.addLayer(this.spill_layer);
            } else {
                this.step[this.index].once('render', function(){
                    if (this.index !== 0){
                        this.step[this.index - 1].setVisible(0);
                    } else {
                        this.step[48].setVisible(0);
                    }
                    this.play();
                }, this);
                this.step[this.index].setVisible(1);
            }

            
        },

        close: function(){
            this.remove();
            this.unbind();
            webgnome.map = {};
        }
    });

    return mapView;
});