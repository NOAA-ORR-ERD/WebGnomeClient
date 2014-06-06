define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/default/map',
    'text!templates/location/index.html',
    'views/wizard/location'
], function($, _, Backbone, ol, olMapView, LocationsTemplate, LocationWizard){
    var locationsView = Backbone.View.extend({
        className: 'container page locations',
        mapView: null,
        popup: null,

        events: {
            'click .load': 'load'
        },


        /**
         * @todo decomp the popover into a new view? How else to get load click event?
         */
        initialize: function(){
            this.mapView = new olMapView({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    new ol.layer.Vector({
                        source: new ol.source.GeoJSON({
                            projection: 'EPSG:3857',
                            url: webgnome.api + '/location',
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
                var pointer = this.forEachFeatureAtPixel(e.pixel, function(feature, layer){
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
                var feature = this.mapView.map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
                    return feature;
                });
                if(feature){
                    this.popup.setPosition(feature.getGeometry().getCoordinates());
                    this.$('.popup').popover('destroy');
                    this.$('.popup').popover({
                        placement: 'top',
                        html: true,
                        title: feature.get('title'),
                        content: feature.get('content') + '<br /><br /><button class="btn btn-primary load" data-slug="' + feature.get('slug') + '">Load</button>'
                    });
                    
                    this.$('.popup').one('shown.bs.popover', _.bind(function(){
                        this.$('.load').on('click', _.bind(function(){
                            var slug = this.$('.load').data('slug');
                            this.load(slug);
                        }, this));
                    }, this));

                    this.$('.popup').one('hide.bs.popover', _.bind(function(){
                        this.$('.load').off('click');
                    }, this));

                    this.$('.popup').popover('show');
                } else {
                    this.$('.popup').popover('destroy');
                }
            }, this);
        },

        load: function(slug){
            this.wizard = new LocationWizard({slug: slug});
        },

        render: function(){
            compiled = _.template(LocationsTemplate);
            $('body').append(this.$el.html(compiled));
            window.map = this.mapView;

            this.popup = new ol.Overlay({
                position: 'bottom-center',
                element: this.$('.popup'),
                stopEvent: true,
                offsetX: -2,
                offsetY: -22
            });

            this.mapView.render();
            this.mapView.map.addOverlay(this.popup);

        }
    });

    return locationsView;
});