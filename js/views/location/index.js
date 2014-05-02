define([
    'jquery',
    'underscore',
    'backbone',
    'lib/ol',
    'lib/text!templates/location/index.html'
], function($, _, Backbone, ol, LocationsTemplate){
    var locationsView = Backbone.View.extend({
        className: 'container page locations',

        initialize: function(){
            this.render();
        },

        setupMap: function(){
            var map = new ol.Map({
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    })
                ],
                view: new ol.View2D({
                    center: ol.proj.transform([-99.6, 40.6], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 4
                })
            });
        },

        render: function(){
            compiled = _.template(LocationsTemplate);
            $('body').append(this.$el.html(compiled));
            this.setupMap();
        }
    });

    return locationsView;
});