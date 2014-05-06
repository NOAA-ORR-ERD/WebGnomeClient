define([
    'jquery',
    'underscore',
    'backbone',
    'lib/ol',
    'views/modal/form',
    'views/default/map',
    'lib/text!templates/form/spill-map.html',
    'lib/text!templates/form/spill-form.html',
], function($, _, Backbone, ol, FormModal, olMapView, MapTemplate, SpillTemplate) {
    var spillForm = FormModal.extend({
        className: 'modal fade form-modal spill-form',
        name: 'spill',
        title: 'Spill',
        interaction: null,

        events: function(){
            return _.defaults({
                'click .point': 'newPoint',
                'click .line': 'newLine'
            }, FormModal.prototype.events);
        },
        
        initialize: function(options, GnomeSpills, GnomeMap) {
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(MapTemplate);
            this.GnomeSpills = GnomeSpills;
            this.GnomeMap = GnomeMap;

            this.source = new ol.source.Vector();
            this.vector = new ol.layer.Vector({
                source: this.source,
                name: 'spills'
            });
            this.select = new ol.interaction.Select({
                style: [new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: null,
                        stroke: new ol.style.Stroke({color: 'orange', width: 2})
                    })
                })]
            });
            this.modify = new ol.interaction.Modify({
                features: this.select.getFeatures()
            });
            this.newPointDraw = new ol.interaction.Draw({
                source: this.source,
                type: /** @type {ol.geom.GeometryType} */ ('Point')
            });
            this.newLineDraw = new ol.interaction.Draw({
                source: this.source,
                type: /** @type {ol.geom.GeometryType} */ ('LineString')
            });

            if(this.GnomeMap.get('filename') == 'EmptyMap.bna'){
                this.ol = new olMapView({
                    interactions: ol.interaction.defaults().extend([
                        this.select,
                        this.modify
                    ]),
                    layers: [
                        this.vector
                    ]
                });
            }

            this.render();
        },

        ready: function() {
            this.ol.render();
            this.$(this.ol.map.getViewport()).on('mousemove', _.bind(function(event){
                var pixel = this.ol.map.getEventPixel(event.originalEvent);
                console.log('asdjkfl');
            }, this));
        },

        newPoint: function(){
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = this.newPointDraw;
            this.ol.map.addInteraction(this.interaction);
            this.interaction.on('drawend', this.drawEnd, this);
        },

        newLine: function(){
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = this.newLineDraw;
            this.ol.map.addInteraction(this.interaction);
            this.interaction.on('drawend', this.drawEnd, this);
        },

        drawEnd: function(event){
            this.ol.map.removeInteraction(this.interaction);
            this.interaction = null;
            var feature = event.feature;
            this.loadSpill(feature);
        },

        loadSpill: function(feature){
            this.$('.map').css('height', '200px');
            this.ol.map.updateSize();
            this.ol.map.getView().setCenter(feature.getGeometry().getCoordinates());
            this.select.getFeatures().push(feature);
            this.$('.modal-body').append(_.template(SpillTemplate));
        },

        unloadSpill: function(){
            this.$('.map').css('height', '');
            this.ol.map.updateSite();
            this.select.getFeatures().clear();

        },

        removeSpill: function(feature){

        }
    });

    return spillForm;
});