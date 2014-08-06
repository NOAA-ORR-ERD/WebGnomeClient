define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'ol',
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, moment, ControlsTemplate, olMapView, ol){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',

        initialize: function(){
            this.ol = new olMapView({
                controls: 'full'
            });
            this.render();
            
            webgnome.model.on('ready', this.render, this);
        },

        render: function(){
            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:MM');

                // check if the model has a map, specifically a bna map that has a geojson output
                // if it does load it's geojson and put it in a layer on the map
                // named modelmap
                if (webgnome.model.get('map').get('obj_type') == 'gnome.map.MapFromBNA') {
                    this.shorelineSource = new ol.source.GeoJSON({
                        url: webgnome.api + '/map/' + webgnome.model.get('map').get('id') + '/geojson'
                    });

                    this.shorelineLayer = new ol.layer.Vector({
                        source: this.shorelineSource
                    });

                    this.ol.layers.push(this.shorelineLayer);
                }
            } else {
                date = moment().format('M/DD/YYYY HH:MM');
            }

            var compiled = _.template(ControlsTemplate, {date: date});
            this.$el.html(compiled);

            this.$('.layers .title').click(_.bind(function(){
                this.$('.layers').toggleClass('expanded');
            }, this));
            this.$('.layers input[type="checkbox"]').click(_.bind(this.toggleLayer, this));
            this.ol.render();

            this.$('.seek > div').slider();
            
            // check if the ui should be functional
            if(!webgnome.hasModel() || !webgnome.validModel()){
                this.$('.seek > div').slider('option', 'disabled', true);
                this.$('.buttons a').addClass('disabled');
            }
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
            this.ol.map.updateSize();
        },

        renderMap: function(){
            this.ol.render();
        },

        toggleLayer: function(event){
            var layer = event.target.id;

            if(layer){
                this.ol.map.getLayers().forEach(function(el, ind, ar){
                    if(el.get('name') == layer){
                        if(el.getVisible()){
                            el.setVisible(false);
                        } else {
                            el.setVisible(true);
                        }
                    }
                });
            }
        },

        close: function(){
            this.remove();
            this.unbind();
            this.ol.close();
        }
    });

    return mapView;
});