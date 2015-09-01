define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'views/form/oil/library',
	'views/default/map',
    'text!templates/form/spill/substance.html',
    'text!templates/form/spill/substance-null.html',
    'text!templates/form/spill/map/controls.html',
    'model/substance',
	'nucos',
	'ol',
	'moment',
    'sweetalert',
	'jqueryDatetimepicker',
    'bootstrap'
], function($, _, Backbone, FormModal, OilLibraryView, SpillMapView, SubstanceTemplate, SubstanceNullTemplate, MapControlsTemplate, SubstanceModel, nucos, ol, moment, swal){
    'use strict';
	var baseSpillForm = FormModal.extend({

        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',
		mapShown: false,
        spillToggle: false,

        events: function(){
            return _.defaults({
                'click .oil-select': 'elementSelect',
                'click .null-substance': 'setSubstanceNull',
                'contextmenu #spill-form-map': 'update',
                'blur .geo-info': 'manualMapInput',
                'click .delete': 'deleteSpill',
                'show.bs.modal': 'renderSubstanceInfo',
                'shown.bs.tab .mapspill': 'locationSelect',
                'click .oil-cache': 'clickCachedOil',
                'click .reload-oil': 'reloadOil',
                'click .spill-button .fixed': 'toggleSpill',
                'click .spill-button .moving': 'toggleSpill'
            }, FormModal.prototype.events);
        },

        oilSelectDisabled: function(){
            if (_.isUndefined(webgnome.model.get('spills').at(0))){
                return false;
            }
            return this.model.get('id') !== webgnome.model.get('spills').at(0).get('id');
        },
        
        spillEndSet: function(){
            var startPosition = this.model.get('release').get('start_position');
            var endPosition = this.model.get('release').get('end_position');
            if ((startPosition[0] !== endPosition[0] && startPosition[1] !== endPosition[1])){
                return false;
            }
            return true;
        },

		initialize: function(options, spillModel){
			FormModal.prototype.initialize.call(this, options);
			if (!_.isUndefined(options.model)){
				this.model = options.model;
			} else {
				this.model = spillModel;
			}
            this.showGeo = (localStorage.getItem('prediction')) === 'fate' ? false : true;
            this.showGeo = ((!_.isUndefined(options.showMap)) ? options.showMap : false) || this.showGeo;
            this.showSubstance = localStorage.getItem('prediction') === 'trajectory' ? false : true;
            if(this.model.get('name') === 'Spill'){
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
			if (!this.showGeo) {
				this.$('.map').hide();
			}
            this.$('#datetime').datetimepicker({
				format: 'Y/n/j G:i',
			});
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));
            if (this.model.isNew()){
                this.$('.delete').prop('disabled', true);
            }

            // Need to add a model if check to see if the user
            // persisted a different bullwinkle_fraction value
            // other than the default
            if (!_.isNull(this.model.get('element_type').get('substance'))){
                this.setEmulsificationOverride();
            }

            this.initTabStatus();
		},

        setEmulsificationOverride: function(){
            var substance = this.model.get('element_type').get('substance');
            var bullwinkle_fraction = substance.get('bullwinkle_fraction');
            var bullwinkle_time = substance.get('bullwinkle_time');
            if (_.isNull(bullwinkle_time)){
                this.$('.manual').val(bullwinkle_fraction * 100);
                this.$('#units-bullwinkle').val('percent');
            } else {
                this.$('.manual').val(bullwinkle_time);
                this.$('#units-bullwinkle').val('time');
            }
        },

        reloadOil: function(e){
            //e.preventDefault();
            var substance = this.model.get('element_type').get('substance');
            substance.fetch({
                success: _.bind(function(model, res, options){
                    this.renderSubstanceInfo(null, model);
                }, this)
            });
        },

        tabStatusSetter: function(){
            var activeTab = this.$('li.active');
            if (activeTab.hasClass('generalinfo') && this.model.validateRelease()){
                this.$('#info').removeClass('ok');
                this.$('#info').addClass('error');
            } else if (activeTab.hasClass('generalinfo')){
                this.$('#info').removeClass('error');
                this.$('#info').addClass('ok');
            }
            if (activeTab.hasClass('substanceinfo') && this.model.validateSubstance()){
                this.$('#substance').removeClass('ok');
                this.$('#substance').addClass('error');
            } else if (activeTab.hasClass('substanceinfo')){
                this.$('#substance').removeClass('error');
                this.$('#substance').addClass('ok');
            }
            if (activeTab.hasClass('mapspill') && this.model.validateLocation()){
                this.$('#map-status').removeClass('ok');
                this.$('#map-status').addClass('error');
            } else if (activeTab.hasClass('mapspill')){
                this.$('#map-status').removeClass('error');
                this.$('#map-status').addClass('ok');
            }
        },

        initTabStatus: function(){
            this.$('.status').removeClass('ok').removeClass('error');
            var release = this.model.get('release');
            if (release.validateLocation(release.attributes)){
                this.$('#map-status').addClass('error');
            } else {
                this.$('#map-status').addClass('ok');
            }
            // if (this.model.validateSubstance(this.model.attributes)){
            //     this.$('#substance').addClass('error');
            // } else {
            //     this.$('#substance').addClass('ok');
            // }
            if (this.model.validateRelease(this.model.attributes)){
                this.$('#info').addClass('error');
            } else {
                this.$('#info').addClass('ok');
            }
        },

        clickCachedOil: function(e){
            swal({
                title: "Warning!",
                text: "Switch selected oil to " + e.target.innerText + "?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Confirm",
                closeOnConfirm: true
            }, _.bind(function(isConfirm){
                if (isConfirm){
                    var oilId = e.target.dataset.adiosId;
                    var cachedOils = JSON.parse(localStorage.getItem('cachedOils'));
                    var substanceModel;
                    for (var i = 0; i < cachedOils.length; i++){
                        if(cachedOils[i].name === oilId){
                            substanceModel = new SubstanceModel(cachedOils[i]);
                            break;
                        }
                    }
                    this.model.get('element_type').set('substance', substanceModel);
                    this.reloadOil();
                }
            }, this));
        },

        convertToSubstanceModels: function(cachedObjArray){
            for (var i = 0; i < cachedObjArray.length; i++){
                if (_.isUndefined(cachedObjArray[i].attributes)){
                    cachedObjArray[i] = new SubstanceModel(cachedObjArray[i]);
                }
            }
            return cachedObjArray;
        },

        updateCachedOils: function(substanceModel){
            var cachedOils = JSON.parse(localStorage.getItem('cachedOils'));
            var substance = substanceModel;
            if (!_.isNull(cachedOils) && !_.isNull(substanceModel) && !_.isUndefined(substance.get('name'))){
                for (var i = 0; i < cachedOils.length; i++){
                    if (cachedOils[i].name === substance.get('name')){
                        cachedOils.splice(i, 1);
                    }
                }
                cachedOils.unshift(substance.toJSON());
                if (cachedOils.length > 4){
                    cachedOils.pop();
                }
            } else {
                cachedOils = [];
                if (!_.isNull(substanceModel) && !_.isUndefined(substance.get('name'))){
                    cachedOils.push(substance);
                }
            }
            var cachedOil_string = JSON.stringify(cachedOils);
            localStorage.setItem('cachedOils', cachedOil_string);
            cachedOils = this.convertToSubstanceModels(cachedOils);
            return cachedOils;
        },

        renderSubstanceInfo: function(e, cached){
            var substance, compiled;
            var enabled = webgnome.model.get('spills').length > 0;
            if (_.isUndefined(cached)){
                if (enabled){
                    substance = webgnome.model.get('spills').at(0).get('element_type').get('substance');
                } else {
                    substance = this.model.get('element_type').get('substance');
                }
            } else {
                substance = cached;
            }
            var cachedOilArray = this.updateCachedOils(substance);
            var oilExists = !_.isNull(substance);
            if (oilExists){
                compiled = _.template(SubstanceTemplate, {
                    name: substance.get('name'),
                    api: Math.round(substance.get('api') * 1000) / 1000,
                    temps: substance.parseTemperatures(),
                    categories: substance.parseCategories(),
                    enabled: enabled,
                    emuls: substance.get('emulsion_water_fraction_max'),
                    bullwinkle: substance.get('bullwinkle_fraction'),
                    oilCache: cachedOilArray
                });
            } else {
                compiled = _.template(SubstanceNullTemplate, {
                    oilCache: cachedOilArray
                });
            }
            this.$('#oilInfo').html('');
            this.$('#oilInfo').html(compiled);
            
            this.$('#oilInfo .add, #oilInfo .locked').tooltip({
                delay: {
                    show: 500,
                    hide: 100
                },
                container: '.modal-body'
            });

            this.$('.panel-heading .state').tooltip({
                    title: function(){
                        var object = $(this).parents('.panel-heading').text().trim();

                        if($(this).parents('.panel').hasClass('complete')){
                            return object + ' requirement met';
                        } else {
                            return object + ' required';
                        }
                    },
                    container: '.modal-body',
                    delay: {show: 500, hide: 100}
                });

            if (!_.isNull(this.model.get('element_type').get('substance'))){
                this.setEmulsificationOverride();
            }

            if (enabled){
                this.model.get('element_type').set('substance', substance);
                webgnome.model.get('spills').at(0).get('element_type').set('substance', substance);
            }
        },

        emulsionUpdate: function(){
            var substance = this.model.get('element_type').get('substance');
            var manualVal = !_.isNaN(parseFloat(this.$('input.manual').val())) ? parseFloat(this.$('input.manual').val()) : '';
            if (manualVal !== '' && !_.isUndefined(substance)){
                substance.set('bullwinkle_time', null);
                if (this.$('#units-bullwinkle').val() === 'time'){
                    substance.set('bullwinkle_time', manualVal);
                } else {
                    substance.set('bullwinkle_fraction', manualVal / 100);
                }
            }
        },

		update: function(){
            this.emulsionUpdate();
            this.tabStatusSetter();
		},

        initOilLib: function(){
            if(_.isUndefined(this.oilLibraryView)){
                this.oilLibraryView = new OilLibraryView({}, this.model.get('element_type'));
                this.oilLibraryView.render();
                this.oilLibraryView.on('hidden', _.bind(this.show, this));
                this.oilLibraryView.on('hidden', this.reloadOil, this);
            } else {
                this.once('hidden', this.oilLibraryView.show, this.oilLibraryView);
            }
            this.hide();
        },

		elementSelect: function(){
            var spills = webgnome.model.get('spills');
            if (this.model.isNew() && spills.length === 0 || !this.model.isNew() && spills.length === 1){
               this.initOilLib();
            } else {
                swal({
                    title: "Warning!",
                    text: "Changing the oil here will change it for all spills!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Select new oil",
                    cancelButtonText: "Keep original oil",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                _.bind(function(isConfirm){
                    if (isConfirm){
                        this.initOilLib();
                    }
                }, this));
            }
		},

        setSubstanceNull: function(){
            var element_type = this.model.get('element_type');
            if (!_.isNull(element_type.get('substance'))) {
                swal({
                    title: "Warning!",
                    text: "Setting the substance to non-weathering will delete the currently entered substance!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Set to Non-weathering",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                _.bind(function(isConfirm){
                    if (isConfirm){
                        if (webgnome.model.get('spills').length > 0){
                            webgnome.model.get('spills').at(0).get('element_type').set('substance', null);
                        } else {
                            element_type.set('substance', null);
                        }
                        this.renderSubstanceInfo();
                    }
                }, this));
            }
        },

        save: function(){
            var validSubstance = this.model.validateSubstance(this.model.attributes);
            if (this.$('.error').length > 0){
                this.$('.error').first().parent().click();
            }
            if (!_.isUndefined(validSubstance)){
                this.error('Error!', validSubstance);
            } else {
                this.clearError();
                FormModal.prototype.save.call(this, _.bind(function(){
                    var oilSubstance = this.model.get('element_type').get('substance');
                    var spills = webgnome.model.get('spills');
                    if (spills.length > 1){
                        spills.forEach(function(spill){
                            var spillSubstance = spill.get('element_type').get('substance');
                            if(_.isNull(oilSubstance) && !_.isNull(spillSubstance) ||
                                !_.isNull(oilSubstance) && !_.isNull(spillSubstance) && oilSubstance.get('name') !== spillSubstance.get('name')){

                                    spill.get('element_type').set('substance', oilSubstance);
                                    spill.save();
                            }
                        });
                    }
                }, this)
                );
            }
        },

        show: function(){
            this.update();
            FormModal.prototype.show.call(this);
        },

        addMapControls: function(){
            var controls = _.template(MapControlsTemplate, {});
            this.$('.ol-viewport').append(controls);
            this.$('[data-toggle="tooltip"]').tooltip({placement: 'right'});
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
                this.toggleMapHover();
                this.addMapControls();
                this.mapShown = true;
                setTimeout(_.bind(function(){
                    this.spillMapView.map.updateSize();
                }, this), 250);
                this.renderSpillFeature();
            }
        },

        toggleMapHover: function(){
            var map = this.spillMapView.map;
            this.$(map.getViewport()).on('mousemove', _.bind(function(e){
                var pixel = map.getEventPixel(e.originalEvent);
                var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer){
                    if (feature.get('name') === 'Shoreline'){
                        return feature;
                    }
                });
                if (!_.isUndefined(feature)){
                    this.$el.css('cursor', 'not-allowed');
                    this.spillPlacementAllowed = false;
                } else if (this.spillToggle){
                    this.$el.css('cursor', 'crosshair');
                    this.spillPlacementAllowed = true;
                } else {
                    this.$el.css('cursor', '');
                    this.spillPlacementAllowed = true;
                }
            }, this));
        },

		locationSelect: function(){
            if (!this.mapShown){
                this.mapRender();
                var map = webgnome.model.get('map');
                if (!_.isUndefined(map) && map.get('obj_type') !== 'gnome.map.GnomeMap'){
                    map.getGeoJSON(_.bind(function(data){
                        this.shorelineSource = new ol.source.Vector({
                            features: (new ol.format.GeoJSON()).readFeatures(data, {featureProjection: 'EPSG:3857'})
                        });
                        var extent = this.shorelineSource.getExtent();
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
                            var startPosition = _.initial(this.model.get('release').get('start_position'));
                            this.spillMapView.map.getLayers().insertAt(1, this.shorelineLayer);
                            this.spillMapView.map.getView().fit(extent, this.spillMapView.map.getSize());
                        }
                    }, this));
                }
            }
		},

        convertCoords: function(coordsArray){
            coordsArray = _.clone(coordsArray);
            coordsArray.pop();
            return coordsArray;
        },

        toggleSpill: function(e){
            e.preventDefault();
            e.stopPropagation();
            if(this.spillToggle){
                this.spillToggle = false;

                if(this.$('.on').hasClass('fixed')){
                    this.spillMapView.map.un('click', this.addPointSpill, this);
                } else {
                    this.spillMapView.map.un('click', this.addLineSpill, this);
                }

                this.$('.on').toggleClass('on');
            } else {
                this.spillToggle = true;
                this.$(e.target).toggleClass('on');

                if(this.$(e.target).hasClass('fixed')){
                    this.spillMapView.map.on('click', this.addPointSpill, this);
                } else {
                    this.spillMapView.map.once('click', this.addLineSpill, this);
                }
            }
            this.update();
        },

        renderSpillFeature: function(){
            var start_position = this.model.get('release').get('start_position');
            var end_position = this.model.get('release').get('end_position');
            var geom, featureStyle;
            if(start_position.length > 2 && start_position[0] === end_position[0] && start_position[1] === end_position[1]){
                start_position = [start_position[0], start_position[1]];
                geom = new ol.geom.Point(ol.proj.transform(start_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection()));
                featureStyle = new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1.0],
                                src: '/img/map-pin.png',
                                size: [32, 40]
                            })
                        });
            } else {
                start_position = [start_position[0], start_position[1]];
                end_position = [end_position[0], end_position[1]];
                geom = new ol.geom.LineString([ol.proj.transform(start_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection()), ol.proj.transform(end_position, 'EPSG:4326', this.spillMapView.map.getView().getProjection())]);
                // featureStyle = new ol.style.Stroke({
                //     color: '#3399CC',
                //     width: 1.25
                // });
            }
            var feature = new ol.Feature({
                geometry: geom,
                spill: this.model.get('id')
            });
            if (!_.isUndefined(featureStyle)){ feature.setStyle(featureStyle);}
            this.source.clear();
            this.source.addFeature(feature);
        },

        addPointSpill: function(e){
            if (this.spillPlacementAllowed){
                var coord = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
                coord.push(0);

                this.model.get('release').set('start_position', coord);
                this.model.get('release').set('end_position', coord);

                this.setManualFields();

                this.toggleSpill(e);
                this.renderSpillFeature();
            }
        },

        setManualFields: function(){
            var startPoint = this.model.get('release').get('start_position');
            var endPoint = this.model.get('release').get('end_position');

            this.$('#start-lat').val(startPoint[1]);
            this.$('#start-lon').val(startPoint[0]);
            this.$('#end-lat').val(endPoint[1]);
            this.$('#end-lon').val(endPoint[0]);
        },

        endPointPlacement: function(e){
            if (this.spillPlacementAllowed){
                var end_position = ol.proj.transform(e.coordinate, e.map.getView().getProjection(), 'EPSG:4326');
                end_position.push(0);
                this.model.get('release').set('end_position', end_position);
                this.setManualFields();
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
                this.model.get('release').set('start_position', start_position);
                this.model.get('release').set('end_position', start_position);
                this.setManualFields();
                this.renderSpillFeature();
                this.spillMapView.map.once('click', this.endPointPlacement, this);
            } else {
                this.spillMapView.map.once('click', this.addLineSpill, this);
            }
        },

        manualMapInput: function(){
            this.mapRender();
            var feature = this.source.forEachFeature(_.bind(function(feature){
                        return feature;
                    }, this));
            if (feature){
                this.source.removeFeature(feature);
            }
            var startCoords = this.coordsParse([this.$('#start-lon').val(), this.$('#start-lat').val()]);
            var endCoords = this.coordsParse([this.$('#end-lon').val(), this.$('#end-lat').val()]);
            var startPosition = [startCoords[0], startCoords[1], 0];
            var endPosition = [endCoords[0], endCoords[1], 0];
            this.model.get('release').set('start_position', startPosition);
            this.model.get('release').set('end_position', endPosition);
            startCoords = ol.proj.transform(startCoords, 'EPSG:4326', 'EPSG:3857');
            endCoords = ol.proj.transform(endCoords, 'EPSG:4326', 'EPSG:3857');
            var coordsArray = [startCoords, endCoords];
            if (startCoords[0] === endCoords[0] && startCoords[1] === endCoords[1]){
                feature = new ol.Feature(new ol.geom.Point(startCoords));
                feature.setStyle( new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1.0],
                                src: '/img/map-pin.png',
                                size: [32, 40]
                            })
                        }));
            } else {
                feature = new ol.Feature(new ol.geom.LineString(coordsArray));
            }
            this.source.addFeature(feature);
            this.spillMapView.map.getView().setCenter(startCoords);
            this.spillMapView.map.getView().setZoom(15);
        },

        coordsParse: function(coordsArray){
            for (var i = 0; i < coordsArray.length; i++){
                if (coordsArray[i].indexOf('°') !== -1){
                    coordsArray[i] = nucos.sexagesimal2decimal(coordsArray[i]);
                }
                coordsArray[i] = parseFloat(coordsArray[i]);
            }
            return coordsArray;
        },

        deleteSpill: function(){
            var id = this.model.get('id');
            var spill = webgnome.model.get('spills').get(id);
            swal({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this spill?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }, _.bind(function(isConfirmed){
                if(isConfirmed){
                    webgnome.model.get('spills').remove(id);
                    webgnome.model.trigger('sync');
                    this.close();
                }
            }, this));
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
            
            if (!_.isUndefined(this.oilLibraryView)){
                this.oilLibraryView.close();
            }
			FormModal.prototype.close.call(this);
		}

	});

	return baseSpillForm;
});