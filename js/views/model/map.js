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

        initialize: function(){
            this.render();
            this.$('.seek > div').slider();

            // check if the ui should be functional
            if(!webgnome.hasModel() || !webgnome.validModel()){
                this.$('.seek > div').slider('option', 'disabled', true);
                this.$('.buttons a').addClass('disabled');
            }
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
            webgnome.map = new ol.Map({
                controls: ol.control.defaults().extend([
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
                    })
                ]),
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

        close: function(){
            this.remove();
            this.unbind();
            webgnome.map = {};
        }
    });

    return mapView;
});