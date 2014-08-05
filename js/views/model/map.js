define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/model/controls.html',
    'views/default/map',
    'ol',
    'model/spill',
    'views/form/spill',
    'jqueryui/slider',
    'jqueryFileupload'
], function($, _, Backbone, moment, ControlsTemplate, olMapView, ol, GnomeSpill, SpillForm){
    var mapView = Backbone.View.extend({
        className: 'map',
        id: 'map',
        full: false,
        width: '70%',

        events: {
            'click .spill-button': 'toggleSpill',
            'mouseout .spill-button': 'toggleSpillBlur',
            'focusout .spill-button': 'toggleSpillBlur'
        },

        initialize: function(){
            this.SpillIndexLayer = new ol.source.Vector();

            this.ol = new olMapView({
                controls: 'full',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        name: 'basemap'
                    }),
                    new ol.layer.Vector({
                        source: this.SpillIndexLayer,
                        name: 'spills'
                    })
                ]
            });
            this.render();
            window.map = this.ol.map;
            
            webgnome.model.on('change', this.render, this);
        },

        render: function(){
            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:MM');
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
                this.ol.map.getLayers().forEach(function(el){
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

        toggleSpill: function(){
            if(this.spillToggle){
                this.ol.map.getViewport().style.cursor = '';
                this.spillToggle = false;
                this.ol.map.un('click', this.addSpill, this);
            } else {
                this.ol.map.getViewport().style.cursor = 'crosshair';
                this.spillToggle = true;
                this.ol.map.on('click', this.addSpill, this);
            }

            this.$('.spill-button').toggleClass('on');
        },

        toggleSpillBlur: function(event){
            event.target.blur();
        },

        addSpill: function(){
            var spill = new GnomeSpill();
            spill.save(null, {
                validate: false,
                success: function(){
                    console.log('added spill');
                    webgnome.model.get('spills').add(spill);
                    webgnome.model.save();
                }
            });

            this.toggleSpill();
        },

        close: function(){
            this.remove();
            this.unbind();
            this.ol.close();
        }
    });

    return mapView;
});