define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/default/map',
    'model/location',
    'model/gnome',
    'sweetalert',
    'text!templates/location/index.html',
    'text!templates/location/list.html',
    'views/wizard/location'
], function($, _, Backbone, ol, OlMapView, GnomeLocation, GnomeModel, swal, LocationsTemplate, ListTemplate, LocationWizard){
    'use strict';
    var locationsView = Backbone.View.extend({
        className: 'page locations',
        mapView: null,
        popup: null,

        events: {
            'click .item': 'highlightLoc',
            'click .item a': 'setupLocation'
        },

        /**
         * @todo decomp the popover into a new view? How else to get load click event?
         */
        initialize: function(options){
            if (!_.isUndefined(options) && _.has(options, 'dom_target')) {
                this.dom_target = options.dom_target;
            } else {
                this.dom_target = 'body';
            }
                    
            this.mapView = new OlMapView({
                controls: [],
                id: 'locations-map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    })
                ]
            });
            this.render();
            $.ajax(webgnome.config.api + '/location').success(_.bind(this.ajax_render, this)).error(function(){
                console.log('Error retrieving location files.');
            });
        },

        clickPin: function(feature){
            this.popup.setPosition(feature.getGeometry().getCoordinates());
            var content = '<button class="btn btn-primary setup btn-block" data-slug="' + feature.get('slug') + '" data-name="' + feature.get('title') + '">Load Location</button>';
            this.$('.popup').popover({
                placement: 'top',
                html: true,
                title: feature.get('title'),
                content: content
            });
            this.$('.popup').popover('show');

            this.$('.popup').one('shown.bs.popover', _.bind(function(){

                this.$('.load').on('click', _.bind(function(){
                    var slug = this.$('.load').data('slug');
                    var name = this.$('.load').data('name');
                    webgnome.model.resetLocation(_.bind(function(){
                        this.load({slug: slug, name: name});
                        this.$('.popup').popover('destroy');
                    }, this));
                }, this));

                this.$('.setup').on('click', _.bind(this.setupLocation, this));
            }, this));

            this.$('.popup').one('hide.bs.popover', _.bind(function(){
                this.$('.load').off('click');
                this.$('.setup').off('click');
            }, this));
        },

        setupLocation: function(e){
            e.stopPropagation();
            var slug = $(e.target).data('slug');
            var name = $(e.target).data('name');
            webgnome.model = new GnomeModel();
            if(_.has(webgnome, 'cache')){
                webgnome.cache.rewind();
            }
            webgnome.model.save(null, {
                validate: false,
                success: _.bind(function(){
                    this.wizard({slug: slug, name: name});
                    this.$('.popup').popover('destroy');
                }, this)
            });
        },

        load: function(options){
            this.loading = true;
            this.trigger('load');
            var locationModel = new GnomeLocation({id: options.slug});
            locationModel.fetch({
                success: _.bind(function(){
                    webgnome.model.fetch({
                        success: _.bind(function(){
                            this.trigger('loaded');
                            this.loading = false;
                            webgnome.router.navigate('config', true);
                        }, this)
                    });
                }, this)
            });
        },

        wizard: function(options){
            this.trigger('load');
            this.wizard_ = new LocationWizard(options);
        },

        render: function(){
            var compiled = _.template(LocationsTemplate);            
            $(this.dom_target).append(this.$el.html(compiled));

            this.mapView.render();
            this.popup = new ol.Overlay({
                position: 'bottom-center',
                element: this.$('.popup')[0],
                stopEvent: true,
                offsetX: -2,
                offsetY: -22
            });
            this.mapView.map.addOverlay(this.popup);
            


            this.registerMapEvents();
        },

        ajax_render: function(geojson){
             this.layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojson,  {featureProjection: 'EPSG:3857'}),
                    wrapX: false
                }),
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1.0],
                        src: '/img/map-pin.png',
                        size: [32, 40]
                    })
                })
            });

            this.mapView.map.addLayer(this.layer);

            var sortedLocations = geojson.features.sort(function(a, b) {
                var textA = a.properties.title.toUpperCase();
                var textB = b.properties.title.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            var list = _.template(ListTemplate, {
                locations: sortedLocations
            });
            this.$('.location-list').append(list);

        },

        registerMapEvents: function(){
            // change mouse to pointer when hovering over a feature.

            this.mapView.map.on('pointermove', _.bind(function(e){
                var pointer = this.forEachFeatureAtPixel(e.pixel, function(feature){
                    return true;
                });
                if(pointer){
                    this.getViewport().style.cursor = 'pointer';
                } else {
                    this.getViewport().style.cursor = '';
                }
            }, this.mapView.map));

            // clicking a location creates a popover with it's related information displayed
            this.mapView.map.on('click', this.mapClickEvent, this);
        },

        highlightLoc: function(e){
            var loc = e.currentTarget;
            var coords = $(loc).data('coords').split(',');
            coords = ol.proj.transform([parseFloat(coords[0]), parseFloat(coords[1])], 'EPSG:4326', 'EPSG:3857');
            this.mapView.map.getView().setCenter(coords);
            this.mapView.map.getView().setZoom(24);

            setTimeout(_.bind(function(){
                e.pixel = this.mapView.map.getPixelFromCoordinate(coords);
                this.mapClickEvent(e);
            }, this), 200);
        },

        mapClickEvent: function(e){
            var feature = this.mapView.map.forEachFeatureAtPixel(e.pixel, function(feature){
                return feature;
            });

            if(feature){
                if(this.$('.popover').length === 0){
                    this.clickPin(feature);
                } else {
                    this.$('.popup').one('hidden.bs.popover', _.bind(function(){
                        setTimeout(_.bind(function(){
                            this.clickPin(feature);
                        }, this), 1);
                    }, this));
                    this.$('.popup').popover('destroy');
                }
            } else {
                this.$('.popup').popover('destroy');
            }
        },

        close: function(){
            this.mapView.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return locationsView;
});