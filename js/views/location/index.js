define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/default/map',
    'text!templates/location/index.html',
    'views/wizard/location'
], function($, _, Backbone, ol, OlMapView, LocationsTemplate, LocationWizard){
    'use strict';
    var locationsView = Backbone.View.extend({
        className: 'page locations',
        mapView: null,
        popup: null,

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
                    }),
                    new ol.layer.Vector({
                        source: new ol.source.Vector({
                            format: new ol.format.GeoJSON(),
                            url: webgnome.config.api + '/location',
                        }),
                        style: new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1.0],
                                src: '/img/map-pin.png',
                                size: [32, 40]
                            })
                        })
                    })
                ]
            });
            this.render();

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
            this.mapView.map.on('click', function(e){
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
            }, this);
        },

        clickPin: function(feature){
            this.popup.setPosition(feature.getGeometry().getCoordinates());
            this.$('.popup').popover({
                placement: 'top',
                html: true,
                title: feature.get('title'),
                content: '<button class="btn btn-primary load" data-slug="' + feature.get('slug') + '" data-name="' + feature.get('title') + '">Load</button>'
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
            }, this));

            this.$('.popup').one('hide.bs.popover', _.bind(function(){
                this.$('.load').off('click');
            }, this));
        },

        load: function(options){
            this.trigger('load');
            this.wizard = new LocationWizard(options);
        },

        render: function(){
            var compiled = _.template(LocationsTemplate);
            $(this.dom_target).append(this.$el.html(compiled));

            this.popup = new ol.Overlay({
                position: 'bottom-center',
                element: this.$('.popup'),
                stopEvent: true,
                offsetX: -2,
                offsetY: -22
            });

            this.mapView.render();
            this.mapView.map.addOverlay(this.popup);

        },

        close: function(){
            this.mapView.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return locationsView;
});