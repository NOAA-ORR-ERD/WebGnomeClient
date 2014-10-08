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
				'blur .geo-info': 'manualMapInput',
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
                    source: this.source,
                    style: new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1.0],
                            src: '/img/spill-pin.png',
                            size: [32, 40]
                        })
                    })
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
                this.spillMapView.map.on('click', _.bind(function(e){
                    this.source.forEachFeature(function(feature){
                        this.source.removeFeature(feature);
                    }, this);
                    var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                    var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                    this.spillCoords = {lat: coords[1], lon: coords[0]};
                    this.source.addFeature(feature);
                }, this));
                setTimeout(_.bind(function(){
                    this.spillMapView.map.updateSize();
                }, this), 250);
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
            var startPosition = _.initial(this.model.get('release').get('start_position'));
            if (startPosition[0] !== 0 && startPosition[1] !== 0){
                startPosition = ol.proj.transform(startPosition, 'EPSG:4326', 'EPSG:3857');
                var feature = new ol.Feature(new ol.geom.Point(startPosition));
                this.source.addFeature(feature);
                
                this.spillMapView.map.getView().setCenter(startPosition);
                this.spillMapView.map.getView().setZoom(15);
            }
			this.spillMapView.map.on('click', _.bind(function(e){
				this.source.forEachFeature(function(feature){
					this.source.removeFeature(feature);
				}, this);
				var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
				var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
				this.spillCoords = {lat: coords[1], lon: coords[0]};
                this.source.addFeature(feature);
			}, this));
            setTimeout(_.bind(function(){
                this.spillMapView.map.updateSize();
            }, this), 250);
		},

        manualMapInput: function(){
            this.mapRender();
            this.source.forEachFeature(function(feature){
                        this.source.removeFeature(feature);
                    }, this);
            var coords = [parseFloat(this.$('#start-lon').val()), parseFloat(this.$('#start-lat').val())];
            coords = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
            var feature = new ol.Feature(new ol.geom.Point(coords));
            this.spillCoords = {lat: coords[1], lon: coords[0]};
            this.source.addFeature(feature);
            this.spillMapView.map.getView().setCenter(coords);
            this.spillMapView.map.getView().setZoom(15);
        },

        releaseLocation: function(){
            this.spillCoords = undefined;
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