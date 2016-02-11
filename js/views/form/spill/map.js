define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'views/default/map',
    'text!templates/form/spill/map.html',
    'text!templates/form/spill/map/controls.html',
    'ol'
], function($, _, Backbone, FormModal, SpillMapView, MapViewTemplate, MapControlsTemplate, ol) {
    'use strict';
    var mapSpillView = FormModal.extend({

        mapShown: false,
        title: 'Place Spill',
        className: 'modal form-modal map-modal-form',

        events: function() {
            return _.defaults({
                'click .spill-button .fixed': 'toggleSpill',
                'click .spill-button .moving': 'toggleSpill'
            }, FormModal.prototype.events);
        },

        initialize: function(options, release) {
            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            } else {
                this.model = release;
            }

            this.origModel = this.model;

            this.source = new ol.source.Vector();
            this.layer = new ol.layer.Vector({
                source: this.source
            });
            var id = 'spill-form-map-' + this.model.cid;
            this.spillMapView = new SpillMapView({
                id: id,
                zoom: 2,
                center: [-128.6, 42.7],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'}),
                        visible: webgnome.model.get('map').geographical
                    }),
                    this.layer
                ]
            });
        },

        render: function(options) {
            if (!this.mapShown) {
                var cid = this.model.cid;
                this.body = _.template(MapViewTemplate, {
                    cid: cid
                });

                FormModal.prototype.render.call(this, options);
                this.mapRender();
            }
        },

        mapRender: function() {
            this.spillMapView.render();
            this.toggleMapHover();
            this.mapShown = true;
            setTimeout(_.bind(function(){
                this.spillMapView.map.updateSize();
            }, this), 250);
            this.renderSpillFeature();
            this.toggleSpill();
            this.locationSelect();
            this.addMapControls();
        },

        checkForShoreline: function(coordsObj) {
            var map = this.spillMapView.map;
            for (var key in coordsObj) {
                coordsObj[key].pop();
                var convertedCoords = new ol.proj.transform(coordsObj[key], 'EPSG:4326', 'EPSG:3857');
                var pixel = map.getPixelFromCoordinate(convertedCoords);
                var feature = map.forEachFeatureAtPixel(pixel, _.bind(this.isShoreline, this));
                    
                if (!_.isUndefined(feature)){
                    return false;
                }
            }
            return true;
        },

        isShoreline: function(feature, layer){
            if (feature.get('name') === 'Shoreline Polys') {
                return feature;
            }
        },

        transformPointCoords: function(coordsArr){
            var outputArr = [];
            var points;
            for (var i = 0; i < coordsArr.length; i++){
                outputArr[i] = new ol.proj.transform(coordsArr, 'EPSG:3857', 'EPSG:4326');
                outputArr[i].push(0);
            }

            return {
                start: outputArr[0],
                end: outputArr[outputArr.length - 1]
            };
        },

        transformLineStringCoords: function(coordsArr){
            var outputArr = [];
            var points;
            for (var i = 0; i < coordsArr.length; i++){
                var pointsArr = [];
                outputArr[i] = [];
                for (var k = 0; k < coordsArr[i].length; k++){
                    var point = new ol.proj.transform(coordsArr[k], 'EPSG:3857', 'EPSG:4326');
                    point.push(0);
                    pointsArr.push(point);
                }
                outputArr[i].push(pointsArr);
            }
            
            var endIndex = outputArr[0][0].length - 1;

            return {start: outputArr[0][0][0], end: outputArr[0][0][endIndex]};
        },

        addPointSpill: function(e){
            if (this.spillPlacementAllowed){
                var coord = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
                coord.push(0);

                this.model.set('start_position', coord);
                this.model.set('end_position', coord);

                this.toggleSpill(e);
                this.renderSpillFeature();
            }
        },

        toggleMapHover: function(){
            var map = this.spillMapView.map;
            this.$(map.getViewport()).on('mousemove', _.bind(function(e){
                var pixel = map.getEventPixel(e.originalEvent);
                var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer){
                    if (feature.get('name') === 'Shoreline Polys'){
                        return feature;
                    }
                });
                this.spillPlacementAllowed = true;
                if (!_.isUndefined(feature)){
                    this.$el.css('cursor', 'not-allowed');
                    this.spillPlacementAllowed = false;
                } else if (this.spillToggle){
                    this.$el.css('cursor', 'crosshair');
                } else {
                    this.$el.css('cursor', '');
                }
            }, this));
        },

        endPointPlacement: function(e){
            if (this.spillPlacementAllowed){
                var end_position = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
                end_position.push(0);
                this.model.set('end_position', end_position);
                this.toggleSpill(e);
                this.renderSpillFeature();
            } else {
                this.spillMapView.map.once('click', this.endPointPlacement, this);
            }
        },

        addLineSpill: function(e){
            if (this.spillPlacementAllowed){
                var start_position = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
                start_position.push(0);
                this.model.set('start_position', start_position);
                this.model.set('end_position', start_position);
                this.renderSpillFeature();
                this.spillMapView.map.once('click', this.endPointPlacement, this);
            } else {
                this.spillMapView.map.once('click', this.addLineSpill, this);
            }
        },

        renderSpillFeature: function(){
            var start_position = this.model.get('start_position');
            var end_position = this.model.get('end_position');
            var geom, featureStyle;
            if(start_position[0] === end_position[0] && start_position[1] === end_position[1]){
                start_position = [start_position[0], start_position[1]];
                geom = new ol.geom.Point(ol.proj.transform(start_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection()));
                featureStyle = new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1.0],
                                src: '/img/map-pin.png',
                                size: [32, 40]
                            })
                        });
                this.renderedFeature = 'Point';
            } else {
                start_position = [start_position[0], start_position[1]];
                end_position = [end_position[0], end_position[1]];
                geom = new ol.geom.LineString([ol.proj.transform(start_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection()), ol.proj.transform(end_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection())]);
                this.renderedFeature = 'LineString';
            }
            var feature = new ol.Feature({
                geometry: geom,
                spill: this.model.get('id')
            });
            if (!_.isUndefined(featureStyle)) { feature.setStyle(featureStyle); }
            this.source.clear();
            this.source.addFeature(feature);

            if (!_.isUndefined(this.modifyInteraction)) {
                var modifyInteract = this.modifyInteraction;
                this.spillMapView.map.removeInteraction(modifyInteract);
            }

            var features = new ol.Collection(this.source.getFeatures());

            var modify = new ol.interaction.Modify({
                features: features,
                deleteCondition: _.bind(function(e) {
                    return ol.events.condition.singleClick(e);
                }, this)
            });
            this.spillMapView.map.addInteraction(modify);
            this.modifyInteraction = modify;
            this.modifyInteraction.on('modifyend', _.bind(this.modifyEndCallback, this));
        },

        modifyEndCallback: function(e) {
            var coordsObj;
            var featureType = this.renderedFeature;

            if (featureType === 'Point') {
                coordsObj = this.transformPointCoords(e.features.getArray()[0].getGeometry().getCoordinates());
            } else if (featureType === 'LineString') {
                coordsObj = this.transformLineStringCoords(e.features.getArray()[0].getGeometry().getCoordinates());
            }
            var coordsCopy = coordsObj;
            var coordsAreValid = this.checkForShoreline(coordsCopy);

            var convertedCoords = this.convertCoordObj(coordsObj);

            if (this.spillPlacementAllowed && coordsAreValid) {
                this.model.set('start_position', convertedCoords.start);
                this.model.set('end_position', convertedCoords.end);
            }

            this.renderSpillFeature();
        },

        drawEndCallback: function(e) {
            var coordsObj;
            var featureType = this.featureType;
            if (featureType === 'Point') {
                coordsObj = this.transformPointCoords(e.feature.getGeometry().getCoordinates());
            } else if (featureType === 'LineString') {
                coordsObj = this.transformLineStringCoords(e.feature.getGeometry().getCoordinates());
            }
            var coordsCopy = coordsObj;
            var coordsAreValid = this.checkForShoreline(coordsCopy);

            var convertedCoords = this.convertCoordObj(coordsObj);

            if (this.spillPlacementAllowed && coordsAreValid) {
                this.model.set('start_position', convertedCoords.start);
                this.model.set('end_position', convertedCoords.end);
                this.renderSpillFeature();
            }

            var draw = this.drawInteraction;
            this.spillMapView.map.removeInteraction(draw);
            this.$('.ol-has-tooltip').removeClass('on');
        },

        getFeatureType: function(e){
            var featureType;

            if (!_.isUndefined(e)) {
                e.preventDefault();
                e.stopPropagation();

                if (this.$(e.target).hasClass('fixed')) {
                    featureType = 'Point';
                    this.$('.fixed').addClass('on');
                    this.$('.moving').removeClass('on');
                } else if (this.$(e.target).hasClass('moving')) {
                    featureType = 'LineString';
                    this.$('.moving').addClass('on');
                    this.$('.fixed').removeClass('on');
                }
            } else if (this.model.isNew()) {
                featureType = "Point";
                this.$('.fixed').addClass('on');
            }

            this.featureType = featureType;
        },

        toggleSpill: function(e){
            this.getFeatureType(e);
            var featureType = this.featureType;

            if (!_.isUndefined(featureType)) {
                if (!_.isUndefined(this.drawInteraction)) {
                    var drawInteract = this.drawInteraction;
                    this.spillMapView.map.removeInteraction(drawInteract);
                }

                var draw = new ol.interaction.Draw({
                    type: featureType
                });
                this.spillMapView.map.addInteraction(draw);
                this.drawInteraction = draw;

                this.drawInteraction.on('drawend', _.bind(this.drawEndCallback, this));
                this.renderSpillFeature();
            }
        },

        convertCoordObj: function(obj){
            for (var key in obj) {
                obj[key].push(0);
            }

            return obj;
        },

        addMapControls: function(){
            var controls = _.template(MapControlsTemplate, {});
            this.$('.ol-viewport').append(controls);
            this.$('[data-toggle="tooltip"]').tooltip({placement: 'right'});
        },

        locationSelect: function(){
            var map = webgnome.model.get('map');
            if (!_.isUndefined(map) && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                map.getGeoJSON(_.bind(function(data){
                    this.shorelineSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(data, {featureProjection: 'EPSG:3857'})
                    });
                    this.shorelineLayer = new ol.layer.Vector({
                        name: 'shoreline',
                        source: this.shorelineSource,
                        style: new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: [228, 195, 140, 0.6]
                            }),
                            stroke: new ol.style.Stroke({
                                color: [228, 195, 140, 0.75],
                                width: 1
                            })
                        })
                    });
                    if(this.spillMapView.map){
                        this.spillMapView.map.getLayers().insertAt(1, this.shorelineLayer);
                        this.spillMapView.setMapOrientation();
                    }
                }, this));
            }
        },

        save: function() {
            var err = this.model.validateLocation();
            if (err) {
                this.error("Placement error!", err);
            } else {
                this.clearError();
                FormModal.prototype.save.call(this);
                this.trigger('save');
                this.hide();
            }
        },

        wizardclose: function() {
            this.model = this.origModel;
            this.trigger('wizardclose');
        },

        close: function(){
            if (!_.isUndefined(this.spillMapView)){
                this.spillMapView.close();
            }
            
            FormModal.prototype.close.call(this);
        }
    });

    return mapSpillView;
});
