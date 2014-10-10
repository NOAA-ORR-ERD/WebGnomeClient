define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'text!templates/form/spill/instant.html',
	'model/spill',
	'views/form/oil/library',
	'views/default/map',
	'geolib',
	'ol',
	'moment',
	'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel, OilLibraryView, SpillMapView, geolib, ol, moment){
	var baseSpillForm = FormModal.extend({

		mapShown: false,

		events: function(){
			return _.defaults({
				'click .oilSelect': 'elementSelect',
				'click .locationSelect': 'locationSelect',
				'click #spill-form-map': 'update',
                'contextmenu #spill-form-map': 'update',
				'blur .start': 'manualMapInput_start',
                'blur .end': 'manualMapInput_end',
                'focus .geo-info': 'releaseLocation'
			}, FormModal.prototype.events);
		},

		initialize: function(options, spillModel){
			FormModal.prototype.initialize.call(this, options);
			if (!_.isUndefined(options.model)){
				this.model = options.model;
			} else {
				this.model = spillModel;
			}
		},

		render: function(options){
			if (this.model.get('name') === 'Spill'){
				var spillsArray = webgnome.model.get('spills').models;
				for (var i = 0; i < spillsArray.length; i++){
					if (spillsArray[i].get('id') === this.model.get('id')){
						var nameStr = 'Spill #' + (i + 1);
						this.model.set('name', nameStr);
						break;
					}
				}
			}

			FormModal.prototype.render.call(this, options);

			var geoCoords_start = this.model.get('release').get('start_position');
            var geoCoords_end = this.model.get('release').get('end_position');
            var units = this.model.get('units');
            if (_.isUndefined(units)){
                units = 'cubic meters';
            }
            this.$('#units').val(units);

			if (geoCoords_start[0] === 0 && geoCoords_start[1] === 0) {
				this.$('.map').hide();
			} else {
				this.locationSelect(null, geoCoords_start);
			}

            if (_.isUndefined(this.model.get('amount'))){
                this.$('#spill-amount').val(0);
                this.model.set('amount', 0);
            }

			this.$('#datetime').datetimepicker({
				format: 'Y/n/j G:i',
			});

		},

		update: function(){

			if(!this.model.isValid()){
				this.error('Error!', this.model.validationError);
			} else {
				this.clearError();
			}
		},

		elementSelect: function(){
            this.hide();
			var oilLibraryView = new OilLibraryView();
			oilLibraryView.render();
			oilLibraryView.on('save', _.bind(this.show, this));
			oilLibraryView.on('hidden', _.bind(this.show, this));
		},

        mapRender: function(){
            if (!this.mapShown){
                this.$('.map').show();
                this.source = new ol.source.Vector();
                this.layer = new ol.layer.Vector({
                    source: this.source
                });
                this.spillMapView = new SpillMapView({
                    id: 'spill-form-map',
                    zoom: 2,
                    center: [-128.6, 42.7],
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.MapQuest({layer: 'osm'})
                        }),
                        this.layer
                    ]
                });
                this.spillMapView.render();
                this.mapShown = true;
                this.$('canvas').on('contextmenu', _.bind(function(){
                    this.update();
                    return false;
                }, this));
                this.spillMapView.map.on('pointerdown', _.bind(function(e){
                    if (e.originalEvent.which === 3){
                        this.source.forEachFeature(function(feature){
                            if (feature.get('name') === 'end'){
                                this.source.removeFeature(feature);
                            }
                        }, this);
                        var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                        feature.setStyle(new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1.0],
                                src: '/img/spill-pin.png',
                                size: [32, 40]
                            })
                        }));
                        feature.set('name', 'end');
                        var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                        var position = [coords[0], coords[1], 0];
                        this.model.get('release').set('end_position', position);
                        this.source.addFeature(feature);
                    }
                }, this));
                this.spillMapView.map.on('click', _.bind(function(e){
                    this.source.forEachFeature(function(feature){
                        if (feature.get('name') === 'start'){
                            this.source.removeFeature(feature);
                        }
                    }, this);
                    var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                    feature.setStyle(new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1.0],
                            src: '/img/spill-pin.png',
                            size: [32, 40]
                        })
                    }));
                    feature.set('name', 'start');
                    var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                    var position = [coords[0], coords[1], 0];
                    this.model.get('release').set('start_positon', position);
                    this.source.addFeature(feature);
                }, this));
                setTimeout(_.bind(function(){
                    this.spillMapView.map.updateSize();
                }, this), 250);
                var startPosition = _.initial(this.model.get('release').get('start_position'));
                if (startPosition[0] !== 0 && startPosition[1] !== 0){
                    startPosition = ol.proj.transform(startPosition, 'EPSG:4326', 'EPSG:3857');
                    var feature = new ol.Feature(new ol.geom.Point(startPosition));
                    feature.setStyle(new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1.0],
                            src: '/img/spill-pin.png',
                            size: [32, 40]
                        })
                    }));
                    feature.set('name', 'start');
                    this.source.addFeature(feature);
                    
                    this.spillMapView.map.getView().setCenter(startPosition);
                    this.spillMapView.map.getView().setZoom(15);
                }
                var endPosition = _.initial(this.model.get('release').get('end_position'));
                if (endPosition[0] !== 0 && endPosition[1] !== 0){
                    endPosition = ol.proj.transform(endPosition, 'EPSG:4326', 'EPSG:3857');
                    var feature = new ol.Feature(new ol.geom.Point(endPosition));
                    feature.setStyle(new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1.0],
                            src: '/img/spill-pin.png',
                            size: [32, 40]
                        })
                    }));
                    feature.set('name', 'end');
                    this.source.addFeature(feature);
                }
            }
        },

		locationSelect: function(e, pastCoords){
            this.mapRender();
            var map = webgnome.model.get('map');
            if (!_.isUndefined(map) && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                map.getGeoJSON(_.bind(function(data){
                    this.shorelineSource = new ol.source.GeoJSON({
                        object: data,
                        projection: 'EPSG:3857'
                    });
                    var extent = this.shorelineSource.getExtent();
                    this.shorelineLayer = new ol.layer.Vector({
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
                        if (startPosition[0] === 0 && startPosition[1] === 0){
                            this.spillMapView.map.getView().fitExtent(extent, this.spillMapView.map.getSize());
                        }
                    }

                }, this));
            }
		},

        manualMapInput_start: function(){
            this.mapRender();
            this.source.forEachFeature(function(feature){
                if (feature.get('name') === 'start'){
                    this.source.removeFeature(feature);
                }
            }, this);
            var coords = [parseFloat(this.$('#start-lon').val()), parseFloat(this.$('#start-lat').val())];
            coords = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
            var feature = new ol.Feature(new ol.geom.Point(coords));
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1.0],
                    src: '/img/spill-pin.png',
                    size: [32, 40]
                })
            }));
            feature.set('name', 'start');
            var position = [coords[0], coords[1], 0];
            this.model.get('release').set('start_position', position);
            this.source.addFeature(feature);
            this.spillMapView.map.getView().setCenter(coords);
            this.spillMapView.map.getView().setZoom(15);
        },

        manualMapInput_end: function(){
            this.mapRender();
            this.source.forEachFeature(function(feature){
                if (feature.get('name') === 'end'){
                    this.source.removeFeature(feature);
                }
            }, this);
            var coords = [parseFloat(this.$('#end-lon').val()), parseFloat(this.$('#end-lat').val())];
            coords = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
            var feature = new ol.Feature(new ol.geom.Point(coords));
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1.0],
                    src: '/img/spill-pin.png',
                    size: [32, 40]
                })
            }));
            feature.set('name', 'end');
            var position = [coords[0], coords[1], 0];
            this.model.get('release').set('end_position', position);
            this.source.addFeature(feature);
            this.spillMapView.map.getView().setCenter(coords);
            this.spillMapView.map.getView().setZoom(15);
        },

        releaseLocation: function(e){
            if (e.currentTarget.id.indexOf('start') > -1){
                this.spillCoords_start = undefined;
            } else {
                this.spillCoords_end = undefined;
            }
        },

		next: function(){
			$('.xdsoft_datetimepicker:last').remove();
			FormModal.prototype.next.call(this);
		},

		back: function(){
			$('.xdsoft_datetimepicker:last').remove();
			FormModal.prototype.back.call(this);
		},

		close: function(){
			$('.xdsoft_datetimepicker:last').remove();
            if (!_.isUndefined(this.spillMapView)){
                this.spillMapView.close();
            }
			FormModal.prototype.close.call(this);
		}

	});

	return baseSpillForm;
});