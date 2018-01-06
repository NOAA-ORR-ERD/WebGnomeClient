define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'views/form/inspect',
], function ($, _, Backbone, BaseView, module, InspectForm) {
    "use strict";
    var layersView = BaseView.extend({
        events: {
            'click .base input': 'toggleLayers',
            'click .env-grid input': 'toggleEnvGrid',
            'click .env-uv input': 'toggleEnvUV',
            'click .env-edit-btn': 'openInspectModal',
            'click .current-grid input': 'toggleGrid',
            'click .current-uv input': 'toggleUV',
            'click .ice-uv input': 'toggleUV',
            //'click .ice-grid input[type="radio"]': 'toggleGrid',
            //'click .ice-tc input[type="checkbox"]': 'toggleIceTC',
            //'click .ice-tc input[type="radio"]': 'toggleIceData',
            'click .layers .title': 'toggleLayerPanel'
        },
        id: 'layers',

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.$el.appendTo('map');
            if(webgnome.hasModel() && this.modelMode !== 'adios'){
                this.modelListeners();
            }
            this.render();
        },

        modelListeners: function(){
            this.listenTo(webgnome.model.get('movers'), 'add remove', this.renderLayers);
            this.listenTo(webgnome.model.get('environment'), 'add remove', this.renderLayers);
            this.listenTo(webgnome.model.get('spills'), 'add remove change', this.renderLayers);
        },

        setupLayersTooltips: function() {
            this.$('.env-grid-hdr').tooltip(this.createTooltipObject("Show Grid"));
            this.$('.env-uv-hdr').tooltip(this.createTooltipObject("Show Data"));
            this.$('.env-edit-hdr').tooltip(this.createTooltipObject("Inspect"));
            //this.$('.env-edit-btn').tooltip(this.createTooltipObject("Edit"));
        },
        createTooltipObject: function(title) {
            return {
                "title": title,
                "container": "body",
                "placement": "bottom"
            };
        },
        toggleLayers: function(event){
            var checked_layers = this.checked_layers = [];
            this.$('.layers input:checked').each(function(i, input){
                checked_layers.push(input.id);
            });
            
            if(checked_layers.indexOf('no_image') === -1){
                
                if(this.layers.sat) {
                    this.viewer.imageryLayers.remove(this.layers.sat);
                    delete this.layers.sat;
                }
                
                var image_layer;
                if(checked_layers.indexOf('bing_aerial') !== -1){
                   image_layer = new Cesium.BingMapsImageryProvider({
                        layers: '1',
                        url : 'https://dev.virtualearth.net',
                        key : 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM',
                        mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
                });} else if (checked_layers.indexOf('open_street_map') !== -1) {
                    image_layer = new Cesium.createOpenStreetMapImageryProvider({
                    layers: '1',
                    url : 'https://a.tile.openstreetmap.org/',
                });} else if (checked_layers.indexOf('noaanavcharts') !== -1) {
                    //tile service at url : 'http://tileservice.charts.noaa.gov/tiles/wmts' but has CORS issue 
                    image_layer = new Cesium.WebMapServiceImageryProvider({
                        layers: '1',
                        url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                });}               
                this.layers.sat = this.viewer.imageryLayers.addImageryProvider(image_layer);
                this.layers.sat.alpha = 0.80;              
            } else  {
                this.viewer.imageryLayers.remove(this.layers.sat);
                delete this.layers.sat;

            }
            
            if(checked_layers.indexOf('bing_aerial') !== -1){
                var bing = new Cesium.BingMapsImageryProvider({
                    layers: '1',
                    url : 'https://dev.virtualearth.net',
                    key : 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM',
                    mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
                });
                if (!this.layers.sat1) {
                    this.layers.sat1 = this.viewer.imageryLayers.addImageryProvider(bing);
                    this.layers.sat1.alpha = 0.80;
                }
            } else if(this.layers.sat1) {
                this.viewer.imageryLayers.remove(this.layers.sat1);
                delete this.layers.sat1;
            }
            
            if(checked_layers.indexOf('open_street_map') !== -1){
                var osm = new Cesium.createOpenStreetMapImageryProvider({
                    layers: '1',
                    url : 'https://a.tile.openstreetmap.org/',
                });
                if (!this.layers.sat2) {
                    this.layers.sat2 = this.viewer.imageryLayers.addImageryProvider(osm);
                    this.layers.sat2.alpha = 0.80;
                }
            } else if(this.layers.sat2) {
                this.viewer.imageryLayers.remove(this.layers.sat2);
                delete this.layers.sat2;
            }

            if(checked_layers.indexOf('modelmap') !== -1){
                this.layers.map.show = true;
            } else {
                this.layers.map.show = false;
            }
            
            var part;
            for (var i = 0; i < this.layers.spills.length; i++) {
                if(checked_layers.indexOf('spills-' + this.layers.spills[i]._id) !== -1){                   
                    this.layers.spills[i].show = true;                    
                } else {                    
                    this.layers.spills[i].show = false;
                } 
                
                if(checked_layers.indexOf('particles-'  + this.layers.spills[i]._id) !== -1 && this.layers.particles[i]){
                    for(part = 2; part < this.layers.particles[i].length; part++){
                        this.layers.particles[i].get(part).show = true;
                    }
                } else if(this.layers.particles[i]) {
                    for(part = 2; part < this.layers.particles[i].length; part++){
                        this.layers.particles[i].get(part).show = false;
                    }
                }
                
            }

            var area;
            if(checked_layers.indexOf('spillableArea') !== -1){
                if(!this.layers.spillable){
                    this.layers.spillable = [];
                    var polygons = webgnome.model.get('map').get('spillable_area');
                    for(var poly in polygons){
                        this.layers.spillable.push(this.viewer.entities.add({
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                                material: Cesium.Color.BLUE.withAlpha(0.25),
                                outline: true,
                                outlineColor: Cesium.Color.BLUE.withAlpha(0.75),
                                height: 0,
                            }
                        }));
                    }
                } else {
                    for(area in this.layers.spillable){
                        this.layers.spillable[area].show = true;
                    }
                }
            } else if(this.layers.spillable){
                for(area in this.layers.spillable){
                    this.layers.spillable[area].show = false;
                }
            }

            if(checked_layers.indexOf('map_bounds') !== -1){
                if(!this.layers.bounds){
                    var map = webgnome.model.get('map');
                    this.layers.bounds = this.viewer.entities.add({
                        name: 'Map Bounds',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(map.get('map_bounds'))),
                            material: Cesium.Color.WHITE.withAlpha(0),
                            outline: true,
                            outlineColor: Cesium.Color.BLUE,
                            height: 0,
                        }
                    });
                } else {
                    this.layers.bounds.show = true;
                }
            } else if(this.layers.bounds){
                this.layers.bounds.show = false;
            }

            if(checked_layers.indexOf('graticule') !== -1) {
                this.graticule.activate();
            } else {
                this.graticule.deactivate();
            }
        },
    });
    return layersView;
});