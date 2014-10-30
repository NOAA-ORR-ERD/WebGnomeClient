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
        
        spillEndSet: function(){
            var startPosition = this.model.get('release').get('start_position');
            var endPosition = this.model.get('release').get('end_position');
            if ((startPosition[0] !== endPosition[0] && startPosition[1] !== endPosition[1])){
                return false;
            }
            return true;
        },

		events: function(){
			return _.defaults({
				'click .oilSelect': 'elementSelect',
                'click .oilName': 'elementSelect',
				'click .locationSelect': 'locationSelect',
				'click #spill-form-map': 'update',
                'contextmenu #spill-form-map': 'update',
				'blur .start': 'manualMapInput_start',
                'blur .end': 'manualMapInput_end'
			}, FormModal.prototype.events);
		},

		initialize: function(options, spillModel){
			FormModal.prototype.initialize.call(this, options);
			if (!_.isUndefined(options.model)){
				this.model = options.model;
			} else {
				this.model = spillModel;
			}
            this.showGeo = (localStorage.getItem('prediction')) === 'fate' ? false : true;

            if(this.model.get('name') == 'Spill'){
                this.model.set('name', 'Spill #' + parseInt(webgnome.model.get('spills').length + 1, 10));
            }
		},

		render: function(options){
			var geoCoords_start = this.model.get('release').get('start_position');
            var geoCoords_end = this.model.get('release').get('end_position');
            var units = this.model.get('units');

            FormModal.prototype.render.call(this, options);

            this.$('#units option[value="' + units + '"]').attr('selected', 'selected');
            var map = webgnome.model.get('map').get('obj_type');
			if (geoCoords_start[0] === 0 && geoCoords_start[1] === 0 && map === 'gnome.map.GnomeMap') {
				this.$('.map').hide();
			} else {
				this.locationSelect();
			}
			this.$('#datetime').datetimepicker({
				format: 'Y/n/j G:i',
			});
		},

		update: function(){
            var oilName = this.model.get('element_type').get('substance').get('name');
            this.$('.oilName').val(oilName);

			if(!this.model.isValid()){
				this.error('Error!', this.model.validationError);
			} else {
				this.clearError();
			}
		},

		elementSelect: function(){
            this.hide();
			var oilLibraryView = new OilLibraryView(this.model.get('element_type'));
			oilLibraryView.render();
			oilLibraryView.on('save', _.bind(this.show, this));
			oilLibraryView.on('hidden', _.bind(this.show, this));
		},

        show: function(){
            this.update();
            FormModal.prototype.show.call(this);
        },

        mapRender: function(){
            if (!this.mapShown){
                this.$('.map').show();
                this.source = new ol.source.Vector();
                var draw = new ol.interaction.Draw({
                    source: this.source,
                    type: 'LineString'
                });
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
                    ],
                    interactions: ol.interaction.defaults().extend([draw])
                });
                this.spillMapView.render();
                this.mapShown = true;

                draw.on('drawend', _.bind(function(){
                    var feature = this.source.forEachFeature(_.bind(function(feature){
                        if (this.source.getFeatures().length > 1){
                            return feature;
                        }
                    }, this));
                    if (feature){
                        this.source.removeFeature(feature);
                    }
                }, this));
                // this.$('canvas').on('contextmenu', _.bind(function(){
                //     this.update();
                //     return false;
                // }, this));
                // this.spillMapView.map.on('pointerdown', _.bind(function(e){
                //     if (e.originalEvent.which === 3){
                //         var feature = this.source.forEachFeature(_.bind(function(feature){
                //             if (feature.get('name') === 'end'){
                //                 return feature;
                //             }
                //         }, this));
                //         if (feature){
                //             this.source.removeFeature(feature);
                //         }
                //         feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                //         feature.setStyle(new ol.style.Style({
                //             image: new ol.style.Icon({
                //                 anchor: [0.5, 1.0],
                //                 src: '/img/spill-pin.png',
                //                 size: [32, 40]
                //             })
                //         }));
                //         feature.set('name', 'end');
                //         var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                //         var position = [coords[0], coords[1], 0];
                //         this.model.get('release').set('end_position', position);
                //         this.$('#end-lat').val(coords[1]);
                //         this.$('#end-lon').val(coords[0]);
                //         this.source.addFeature(feature);
                //     }
                // }, this));
                // this.spillMapView.map.on('click', _.bind(function(e){
                //     var feature = this.source.forEachFeature(_.bind(function(feature){
                //         if (feature.get('name') === 'start'){
                //             return feature;
                //         }
                //     }, this));
                //     if (feature){
                //         this.source.removeFeature(feature);
                //     }
                //     feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                //     feature.setStyle(new ol.style.Style({
                //         image: new ol.style.Icon({
                //             anchor: [0.5, 1.0],
                //             src: '/img/spill-pin.png',
                //             size: [32, 40]
                //         })
                //     }));
                //     var start = this.model.get('release').get('start_position');
                //     var end = this.model.get('release').get('end_position');
                //     var endPointUnset = (start[1] === end[1] && start[0] === end[0]);
                //     feature.set('name', 'start');
                //     var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                //     var position = [coords[0], coords[1], 0];
                //     this.model.get('release').set('start_position', position);
                //     this.$('#start-lat').val(coords[1]);
                //     this.$('#start-lon').val(coords[0]);
                //     if (endPointUnset){
                //         this.$('#end-lat').val(coords[1]);
                //         this.$('#end-lon').val(coords[0]);
                //         this.model.get('release').set('end_position', position);
                //     }
                //     this.source.addFeature(feature);
                // }, this));
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

		locationSelect: function(){
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
                        var startPosition = _.initial(this.model.get('release').get('start_position'));
                        this.spillMapView.map.getLayers().insertAt(1, this.shorelineLayer);
                        this.spillMapView.map.getView().fitExtent(extent, this.spillMapView.map.getSize());
                    }

                }, this));
            }
		},

        manualMapInput_start: function(){
            this.mapRender();
            var feature = this.source.forEachFeature(_.bind(function(feature){
                        if (feature.get('name') === 'start'){
                            return feature;
                        }
                    }, this));
            if (feature){
                this.source.removeFeature(feature);
            }
            var coords = [this.$('#start-lon').val(), this.$('#start-lat').val()];
            coords = this.coordsParse(coords);
            coords = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
            feature = new ol.Feature(new ol.geom.Point(coords));
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
            var feature = this.source.forEachFeature(_.bind(function(feature){
                        if (feature.get('name') === 'end'){
                            return feature;
                        }
                    }, this));
            if (feature){
                this.source.removeFeature(feature);
            }
            var coords = [this.$('#end-lon').val(), this.$('#end-lat').val()];
            coords = this.coordsParse(coords);
            coords = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
            feature = new ol.Feature(new ol.geom.Point(coords));
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
        },

        coordsParse: function(coordsArray){
            for (var i = 0; i < coordsArray.length; i++){
                if (coordsArray[i].indexOf('°') !== -1){
                    coordsArray[i] = geolib.sexagesimal2decimal(coordsArray[i]);
                }
                coordsArray[i] = parseFloat(coordsArray[i]);
            }
            return coordsArray;
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