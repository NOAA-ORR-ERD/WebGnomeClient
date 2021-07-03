define([
    'jquery',
    'underscore',
    'backbone',
    'nucos',
    'moment',
    'sweetalert',
    'views/modal/form',
    'views/form/oil/library',
    'views/form/spill/map',
    'views/form/oil/oilinfo',
    'text!templates/form/spill/substance.html',
    'text!templates/form/spill/substance-null.html',
    'text!templates/form/spill/position_single.html',
    'text!templates/form/spill/position_double.html',
    'text!templates/form/spill/windage.html',
    'model/spill/gnomeoil',
    'model/spill/nonweatheringsubstance',
    'jqueryDatetimepicker',
    'bootstrap'
], function($, _, Backbone, nucos, moment, swal,
            FormModal, OilLibraryView, MapFormView, OilInfoView,
            SubstanceTemplate, NonWeatheringSubstanceTemplate, PositionSingleTemplate,
            PositionDoubleTemplate, WindageTemplate, GnomeOil, NonWeatheringSubstance) {
    'use strict';
    var baseSpillForm = FormModal.extend({

        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',
        mapShown: false,
        spillToggle: false,

        events: function() {
            return _.defaults({
                'click .oil-select': 'oilSelect',
                'click .null-substance': 'setSubstanceNonWeathering',
                'contextmenu #spill-form-map': 'update',
                'keyup .geo-info': 'manualMapInput',
                'keyup .input-sm': 'emulsionUpdate',
                'change .input-sm': 'emulsionUpdate',
                'click .delete': 'deleteSpill',
                'show.bs.modal': 'renderSubstanceInfo',
               // 'show.bs.modal': 'renderPositionInfo',
                'click .oil-cache': 'clickCachedOil',
                'click .reload-oil': 'reloadOil',
                'click .reset-bull': 'resetBull',
                'click .oil-info': 'initOilInfo',
                'click .map-modal': 'initMapModal',
                'click .add-endpoint': 'addEndpoint',
                'click .remove-endpoint': 'removeEndpoint'
            }, FormModal.prototype.events);
        },

        oilSelectDisabled: function() {
            if (_.isUndefined(webgnome.model.get('spills').at(0))) {
                return false;
            }

            return this.model.get('id') !== webgnome.model.get('spills').at(0).get('id');
        },

        spillEndSet: function() {
            var startPosition = this.model.get('release').get('start_position');
            var endPosition = this.model.get('release').get('end_position');

            if ((startPosition[0] !== endPosition[0] &&
                    startPosition[1] !== endPosition[1])) {
                return false;
            }

            return true;
        },

        initialize: function(options, spillModel) {
            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            }
            else {
                this.model = spillModel;
            }

            this.showGeo = options.showGeo ? options.showGeo : true;
            this.showSubstance = options.showSubstance ? options.showSubstance : true;

            if (this.model.get('name') === 'Spill') {
                this.model.set('name', 'Spill #' + parseInt(webgnome.model.get('spills').length + 1, 10));
            }
        },

        render: function(options) {
            var units = this.model.get('units');

            FormModal.prototype.render.call(this, options);

            if (webgnome.model.get('mode') === 'adios') {
                this.$('.release-time').hide();
                this.$el.addClass('adios');
            }

            this.$('#units option[value="' + units + '"]').prop('selected', 'selected');
            var map = webgnome.model.get('map').get('obj_type');

            if (!this.showGeo) {
                this.$('.map').hide();
            }

            this.renderPositionInfo();
            this.renderWindageInfo();

            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  "1970/01/01",
                yearStart: "1970",
            });

            this.$('#datepick').on('click', _.bind(function() {
                this.$('#datetime').datetimepicker('show');
            }, this));

            if (this.model.isNew()) {
                this.$('.delete').prop('disabled', true);
            }

            // Need to add a model if check to see if the user
            // persisted a different bullwinkle_fraction value
            // other than the default
            if (!_.isNull(this.model.get('substance'))) {
                this.setEmulsificationOverride();
            }

            this.tabStatusSetter();

            this.on('show.bs.modal', _.bind(function() {
                this.update();
            }, this));
        },

        setEmulsificationOverride: function() {
            var substance = this.model.get('substance');
            var bullwinkle_fraction = substance.get('bullwinkle_fraction');
            var bullwinkle_time = substance.get('bullwinkle_time');

            if (_.isNull(bullwinkle_time) || bullwinkle_time<0) {
                this.$('.manual').val(Math.round(bullwinkle_fraction * 100));
                this.$('#units-bullwinkle').val('percent');
            }
            else {
                this.$('.manual').val(bullwinkle_time);
                this.$('#units-bullwinkle').val('time');
            }
        },

        resetBull: function(e) {
            if (!this.model.get('substance').get('is_weatherable')) {
                return;
            }
            var oilId = this.model.get('substance').get('adios_oil_id');
            var oilName = this.model.get('substance').get('name');
            var substance = new GnomeOil({adios_oil_id: oilId, name: oilName});
            //re-fetch the substance from the oil library and set the bullwinkle back to default
            substance.fetch(
                {
                    success: _.bind(function(model){
                        var subs = this.model.get('substance');
                        subs.set('bullwinkle_time', model.get('bullwinkle_time'));
                        subs.set('bullwinkle_fraction', model.get('bullwinkle_fraction'));
                        this.clearError();
                        this.renderSubstanceInfo(null, subs);

                    }, this),
                    error: function() {swal({
                        title: "Error!",
                        text: "Unable to reset emulsification settings because oil could not be retrieved. Did you set an invalid ADIOS ID?",
                        type: "error",
                        closeOnConfirm: true,
                    });}
                }
            );
        },

        reloadOil: function(e) {
            //e.preventDefault();
            var substance = this.model.get('substance');

            if (substance) {
                this.clearError();
                this.renderSubstanceInfo(null, substance);
            }
        },

        tabStatusSetter: function() {
            if (this.model.validateAmount()) {
                this.$('#info').removeClass('ok');
                this.$('#info').addClass('error');
            }
            else {
                this.$('#info').removeClass('error');
                this.$('#info').addClass('ok');
            }

            if (this.model.validateSubstance()) {
                this.$('#substance').removeClass('ok');
                this.$('#substance').addClass('error');
            }
            else {
                this.$('#substance').removeClass('error');
                this.$('#substance').addClass('ok');
            }

            if (this.model.validateLocation()) {
                this.$('#map-status').removeClass('ok');
                this.$('#map-status').addClass('error');
            }
            else {
                this.$('#map-status').removeClass('error');
                this.$('#map-status').addClass('ok');
            }
        },

        clickCachedOil: function(e) {
            swal({
                title: "Warning!",
                text: "Switch selected oil to " + e.target.innerText + "?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Confirm",
                closeOnConfirm: true
            }).then(_.bind(function(isConfirm) {
                if (isConfirm) {
                    var oilId = $(e.target).data('adiosId');
                    var cachedOils = JSON.parse(localStorage.getItem('cachedOils'));
                    var substanceModel;

                    for (var i = 0; i < cachedOils.length; i++) {
                        if (cachedOils[i].name === oilId) {
                            substanceModel = new GnomeOil(cachedOils[i]);
                            break;
                        }
                    }

                    this.model.set('substance', substanceModel);
                    this.reloadOil();
                }
            }, this));
        },

        convertToSubstanceModels: function(cachedObjArray) {
            for (var i = 0; i < cachedObjArray.length; i++) {
                if (_.isUndefined(cachedObjArray[i].attributes)) {
                    cachedObjArray[i] = new GnomeOil(cachedObjArray[i]);
                }
            }

            return cachedObjArray;
        },

        updateCachedOils: function(substanceModel) {
            var cachedOils = JSON.parse(localStorage.getItem('cachedOils'));
            var substance = substanceModel;

            if (!_.isNull(cachedOils) &&
                    !_.isNull(substanceModel) &&
                    !_.isUndefined(substance.get('name'))) {
                for (var i = 0; i < cachedOils.length; i++) {
                    if (cachedOils[i].name === substance.get('name')) {
                        cachedOils.splice(i, 1);
                    }
                }

                cachedOils.unshift(substance.toJSON());

                if (cachedOils.length > 4) {
                    cachedOils.pop();
                }
            }
            else {
                cachedOils = [];

                if (!_.isNull(substanceModel) &&
                        !_.isUndefined(substance.get('name'))) {
                    cachedOils.push(substance);
                }
            }

            var cachedOil_string = JSON.stringify(cachedOils);
            localStorage.setItem('cachedOils', cachedOil_string);
            cachedOils = this.convertToSubstanceModels(cachedOils);

            return cachedOils;
        },

        renderSubstanceInfo: function(e, cached) {
            var substance, compiled;
            var enabled = webgnome.model.get('spills').length > 0;

            if (_.isUndefined(cached)) {
                if (enabled) {
                    substance = webgnome.model.get('spills').at(0).get('substance');
                }
                else {
                    substance = this.model.get('substance');
                }
            }
            else {
                substance = cached;
            }

            var oilExists = substance.get('is_weatherable');
            var cachedOilArray;
            if (oilExists) {
                cachedOilArray = this.updateCachedOils(substance);
                compiled = _.template(SubstanceTemplate)({
                    size: this.showGeo ? '12': '6',
                    name: substance.get('name'),
                    api: Math.round(substance.get('api') * 1000) / 1000,
                    temps: substance.parseTemperatures(),
                    categories: substance.parseCategories(),
                    enabled: enabled,
                    emuls: substance.get('emulsion_water_fraction_max'),
                    bullwinkle: substance.get('bullwinkle_fraction'),
                    oilCache: cachedOilArray
                });
            }
            else {
                compiled = _.template(NonWeatheringSubstanceTemplate)({
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
                    title: function() {
                        var object = $(this).parents('.panel-heading').text().trim();

                        if ($(this).parents('.panel').hasClass('complete')) {
                            return object + ' requirement met';
                        }
                        else {
                            return object + ' required';
                        }
                    },
                    container: '.modal-body',
                    delay: {show: 500, hide: 100}
                });

            if (substance.get('is_weatherable')) {
                this.setEmulsificationOverride();
            }

            if (enabled) {
                this.model.set('substance', substance);
                webgnome.model.get('spills').at(0).set('substance', substance);
            }
        },

        renderPositionInfo: function(e) {
            var isSpillPoint = this.model.get('release').isReleasePoint();
            var start_point = this.model.get('release').get('start_position');
            var end_point = this.model.get('release').get('end_position');
            var compiled;

            var lat_formats = "64.5011N<br/>(decimal degrees)<br/>64 30.066N<br/>(degrees decimal minutes) <br/>64 30 3.96N<br/>(degrees minutes seconds)";
            var lon_formats = '165.4064W<br/>(decimal degrees)<br/>165 24.384W<br/>(degrees decimal minutes)<br/>165 24 23.04W<br/>(degrees minutes seconds)';

            if (!_.isNull(e) && isSpillPoint) {
                compiled = _.template(PositionSingleTemplate)({
                    start_coords: {'lat': start_point[1], 'lon': start_point[0]},
                    lat_formats: lat_formats,
                    lon_formats: lon_formats
                });
            }
            else {
                compiled = _.template(PositionDoubleTemplate)({
                    start_coords: {'lat': start_point[1], 'lon': start_point[0]},
                    end_coords: {'lat': end_point[1], 'lon': end_point[0]},
                    lat_formats: lat_formats,
                    lon_formats: lon_formats
                });
            }

            this.$('#positionInfo').html('');
            this.$('#positionInfo').html(compiled);

            this.$('.position input[name="lat"]').tooltip({
                trigger: 'focus',
                html: true,
                width: 200,
                placement: 'top',
                viewport: 'body'
            });

            this.$('.position input[name="lng"]').tooltip({
                trigger: 'focus',
                html: true,
                width: 200,
                placement: 'top',
                viewport: 'body'
            });
        },
        
        renderWindageInfo: function(e) {

            var compiled;
            var windage_init = this.model.getWindageInitializer();
            var windage_range = windage_init.get("windage_range");
            var windage_persist_val = windage_init.get("windage_persist");
            
            var windage_persist = true;
            if (windage_persist_val > 0) {
                windage_persist = false;
            }
            
            
            compiled = _.template(WindageTemplate)({
                    windage_low: windage_range[0]*100,
                    windage_high: windage_range[1]*100,
                    windage_persist: windage_persist,                   
                });



            this.$('#windageInfo').html('');
            this.$('#windageInfo').html(compiled);


        },
        
        updateWindageInfo: function(e) {

            var windage_init = this.model.getWindageInitializer();
            
            var windage_low = parseFloat(this.$('#windage_low').val())/100;
            var windage_high = parseFloat(this.$('#windage_high').val())/100;
            var windage_persist = this.$('#windage_persist').val();
            
            windage_init.set("windage_range",[windage_low,windage_high]);
            windage_init.set("windage_persist",windage_persist);


          

        },
        
        
        addEndpoint: function(e) {
            this.renderPositionInfo(null);
        },

        removeEndpoint: function(e) {
            var start_pos = this.model.get('release').get('start_position');
            this.model.get('release').set('end_position', start_pos);
            this.renderPositionInfo(e);
        },

        emulsionUpdate: function() {
            var substance = this.model.get('substance');
            var manualVal = !_.isNaN(parseFloat(this.$('input.manual').val())) ? parseFloat(this.$('input.manual').val()) : '';

            if (manualVal !== '' && !_.isUndefined(substance)) {
                substance.set('bullwinkle_time', null);

                if (this.$('#units-bullwinkle').val() === 'time') {
                    substance.set('bullwinkle_time', manualVal);
                }
                else {
                    substance.set('bullwinkle_fraction', manualVal / 100);
                }
            }
        },

        update: function() {
            //this.emulsionUpdate();
            this.tabStatusSetter();
            if (webgnome.model.get('mode') === 'gnome') {
                this.updateWindageInfo();
            }
            if (this.model.validationContext === 'map') {
                this.error(this.model.get('release').validationError);
            } else {
                this.clearError();
            }
            // this.setCoords();
        },

        initOilLib: function() {
            if (_.isUndefined(this.oilLibraryView)) {
                var subs;
                if (!this.model.get('substance').get('is_weatherable')) {
                    subs = new GnomeOil();
                } else {
                    subs = this.model.get('substance');
                }
                this.oilLibraryView = new OilLibraryView({}, subs);
                this.oilLibraryView.render();
                this.oilLibraryView.on('hidden', _.bind(function(){
                    if (!_.isUndefined(subs.get('name'))){
                        this.model.set('substance', subs);
                        webgnome.model.setGlobalSubstance(subs);
                    }
                    this.show();
                    this.reloadOil();
                    this.tabStatusSetter();
                }, this));
            }
            else {
                this.once('hidden',
                          this.oilLibraryView.show,
                          this.oilLibraryView);
            }

            this.hide();
        },

        initOilInfo: function() {

            this.oilInfoView = new OilInfoView({}, this.model.get('substance'));
            this.oilInfoView.on('hidden', _.bind(this.show, this));
            //this.hide();
        },

        oilSelect: function() {
            var spills = webgnome.model.get('spills');

            if (this.model.isNew() && spills.length === 0 ||
                    !this.model.isNew() && spills.length === 1) {
               this.initOilLib();
            }
            else {
                swal({
                    title: "Warning!",
                    text: "Changing the oil here will change it for all spills!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Select new oil",
                    cancelButtonText: "Keep original oil",
                    closeOnConfirm: true,
                    closeOnCancel: true
                }).then(_.bind(function(isConfirm) {
                    if (isConfirm) {
                        this.initOilLib();
                    }
                }, this));
            }
        },

        setSubstanceNonWeathering: function() {
            var substance = this.model.get('substance');

            if (substance.get('is_weatherable')) {
                swal({
                    title: "Warning!",
                    text: "Setting the substance to non-weathering will delete the currently entered substance!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Set to Non-weathering",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: true,
                    closeOnCancel: true
                }).then(_.bind(function(isConfirm) {
                    if (isConfirm) {
                        if (webgnome.model.get('spills').length > 0) {
                            webgnome.model.setGlobalSubstance(new NonWeatheringSubstance());
                        }
                        else {
                            this.model.set('substance', new NonWeatheringSubstance());
                            this.model.save();
                        }

                        this.renderSubstanceInfo();
                        this.tabStatusSetter();
                    }
                }, this));
            }
        },

        save: function() {
            var validSubstance = this.model.validateSubstance(this.model.attributes);

            if (this.$('.error').length > 0) {
                this.$('.error').first().parent().click();
            }

            if (!_.isUndefined(validSubstance)) {
                this.error('Error!', validSubstance);
            }
            else {
                this.clearError();
                this.update();
                FormModal.prototype.save.call(this);
            }
        },

        initMapModal: function() {
            this.mapModal = new MapFormView({}, this.model.get('release'));
            this.mapModal.render();

            this.mapModal.on('hidden', _.bind(function() {
                this.show();
                this.mapModal.close();
            }, this));

            this.mapModal.on('save', this.setManualFields, this);
            this.hide();
        },

        setManualFields: function() {
            var startPoint = this.model.get('release').get('start_position');
            var endPoint = this.model.get('release').get('end_position');
            this.renderPositionInfo();
            this.clearError();
            this.update();

            this.$('#start-lat').val(startPoint[1]);
            this.$('#start-lon').val(startPoint[0]);
            this.$('#end-lat').val(endPoint[1]);
            this.$('#end-lon').val(endPoint[0]);
        },

        manualMapInput: function() {
            var start = [this.$('#start-lon').val(), this.$('#start-lat').val()];
            var end = [this.$('#end-lon').val(), this.$('#end-lat').val()];

            var startCoords = this.coordsParse(_.clone(start));
            var endCoords = this.coordsParse(_.clone(end));
            if (_.some([startCoords, endCoords].flat(), function(e){return _.isNaN(e);})){
                return;
            }

            var startPosition = [startCoords[0], startCoords[1], 0];
            var endPosition = [endCoords[0], endCoords[1], 0];

            this.model.get('release').set('start_position', startPosition);

            if (_.isUndefined(endPosition[0]) ||
                    _.isUndefined(endPosition[1])) {
                this.model.get('release').set('end_position', startPosition);
            }
            else {
                this.model.get('release').set('end_position', endPosition);
            }

            this.showParsedCoords('start');
            this.showParsedCoords('end');
        },

        showParsedCoords: function(position) {
            var coords = this.model.get('release').get(position + '_position');

            this.$('.' + position + '-lat-parse').text('(' + coords[1].toFixed(4) + ')');
            this.$('.' + position + '-lon-parse').text('(' + coords[0].toFixed(4) + ')');
        },

        hideParseCoords: function(position) {
            this.$('.' + position + '-lat-parse').text('');
            this.$('.' + position + '-lon-parse').text('');
        },

        coordsParse: function(coordsArray) {
            for (var i = 0; i < coordsArray.length; i++) {
                if (!_.isUndefined(coordsArray[i]) &&
                        coordsArray[i].trim().indexOf(' ') !== -1) {
                    coordsArray[i] = nucos.sexagesimal2decimal(coordsArray[i]);
                    coordsArray[i] = parseFloat(coordsArray[i]);
                }
                else if (!_.isUndefined(coordsArray[i])) {
                    coordsArray[i] = parseFloat(coordsArray[i]);
                }
            }

            return coordsArray;
        },

        deleteSpill: function() {
            var id = this.model.get('id');

            swal({
                title: 'Delete "' + this.model.get('name') + '"',
                text: 'Are you sure you want to delete this spill?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed) {
                if (isConfirmed) {
                    webgnome.model.get('spills').remove(id);
                    webgnome.model.save();
                    this.on('hidden', _.bind(function() {
                        this.trigger('wizardclose');
                    }, this));
                    this.hide();
                }
            }, this));
        },

        next: function() {
            this.$('#datetime').datetimepicker('destroy');
            FormModal.prototype.next.call(this);
        },

        back: function() {
            this.$('#datetime').datetimepicker('destroy');
            FormModal.prototype.back.call(this);
        },

        close: function() {
            this.$('#datetime').datetimepicker('destroy');

            if (!_.isUndefined(this.mapModal)) {
                this.mapModal.close();
            }

            if (!_.isUndefined(this.oilInfoView)) {
                this.oilInfoView.close();
            }

            if (!_.isUndefined(this.oilLibraryView)) {
                this.oilLibraryView.close();
            }

            FormModal.prototype.close.call(this);
        }

    });

    return baseSpillForm;
});
