define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/default/load',
    'text!templates/default/index.html',
    'views/wizard/adios',
    'views/wizard/gnome',
    'views/default/map',
    'model/gnome'
], function($, _, Backbone, ol, LoadView, IndexTemplate, AdiosWizard, GnomeWizard, MapView, GnomeModel){
    'use strict';
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .advanced': 'setup',
            'click .location': 'location',
            'click .adios-wizard': 'adios',
            'click .gnome-wizard': 'gnome'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
            this.load = new LoadView({simple: true, el: this.$('.load')});
            this.mapview = new MapView({
                id: 'map',
                controls: [],
                layers: [
                     new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        name: 'mapquest',
                        type: 'base',
                    }),
                    new ol.layer.Tile({
                        name: 'noaanavcharts',
                        source: new ol.source.TileWMS({
                            url: 'http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/services/RNC/NOAA_RNC/MapServer/WMSServer',
                            params: {'LAYERS': '1', 'TILED': true}
                        }),
                        opacity: 0.5,
                    })
                ]
            });
            this.mapview.render();
            this.geolocation = new ol.Geolocation({
                projection: this.mapview.map.getView().getProjection()
            });
            this.geolocation.setTracking(true);
            this.geolocation.on('change:position', _.bind(function(){
                this.mapview.map.getView().setCenter(this.geolocation.getPosition());
                this.mapview.map.getView().setZoom(20);
            },this));
        },

        setup: function(e){
            e.preventDefault();
            if(webgnome.hasModel()){
                webgnome.model.set('mode', 'gnome');
                webgnome.model.save({'name': 'Model'});
            }
            webgnome.router.navigate('config', true);
        },

        location: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
        },

        adios: function(e){
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'ADIOS Model_',
                duration: 432000,
                time_step: 3600,
                mode: 'adios'
            });
            webgnome.model.save(null, {
                validate: false,
                success: function(){
                    webgnome.router.navigate('adios', true);
                }
            });
            localStorage.setItem('view', 'fate');
        },

        gnome: function(e){
            e.preventDefault();
            var wiz = new GnomeWizard();
        },

        close: function(){
            this.load.close();
            this.mapview.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return indexView;
});