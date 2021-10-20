define([
    'underscore',
    'module',
    'jquery',
    'backbone',
    'views/modal/form',
    'views/default/dzone',
    'views/form/oil/oilinfo',
    'text!templates/oil/substance.html',
    'text!templates/oil/substance-null.html',
    'model/spill/gnomeoil',
    'model/spill/nonweatheringsubstance'
], function(_, module, $, Backbone, FormModal,
            Dzone, OilInfoView, SubstanceTemplate, NonWeatheringSubstanceTemplate, GnomeOil, NonWeatheringSubstance) {
    'use strict';
    var oilUploadForm = FormModal.extend({
        title: 'Upload File from ADIOS Oil Database',
        className: 'modal form-modal model-form',

        events: function(){
            return _.defaults({
                'click .cancel': 'close',
                'click .oil-load': 'load_oil',
                'click .reset-bull': 'resetBull',
                'keyup .input-sm': 'emulsionUpdate',
                'change .input-sm': 'emulsionUpdate',
                'click .oil-info': 'initOilInfo',
                'show.bs.modal': 'renderSubstanceInfo'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model){
            this.module = module;
            //this.on('hidden', this.close); //to close when cancel option is used
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        render: function(options){
            this.body = _.template('<div id="adios-upload"></div>')();
            FormModal.prototype.render.call(this, options);

        },

        renderSubstanceInfo: function(e, cached) {
            var compiled;
            var substance = this.model;
            var enabled = substance.get('is_weatherable');

            if (!_.isUndefined(cached)) {
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
            this.body = compiled;
            this.$('#adios-upload').html('');
            this.$('#adios-upload').html(compiled);

            /*this.$('#adios-upload .add, #adios-upload .locked').tooltip({
                delay: {
                    show: 500,
                    hide: 100
                },
                container: '.modal-body'
            });*/

           /* this.$('.panel-heading .state').tooltip({
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
                });*/

            if (substance.get('is_weatherable')) {
                this.setEmulsificationOverride();
            }

            else {
                this.load_oil();
            }
        },

        initOilInfo: function() {

            this.oilInfoView = new OilInfoView({}, this.model);
            this.oilInfoView.on('hidden', _.bind(this.show, this));
            //this.hide();
        },

        load_oil: function() {

            if (this.$('.adios-upload').hasClass('hidden')) {
                this.$('.adios-upload').removeClass('hidden');

                this.dzone = new Dzone({
                    maxFiles: 1,
                    maxFilesize: webgnome.config.upload_limits.map, // 10MB
                    acceptedFiles: '.json, .txt',
                    autoProcessQueue:true,
                    dictDefaultMessage: 'Drop file here to load an oil (or click to navigate). <br>Click the help icon for details on supported file formats.',
                });
                this.$('.adios-upload').append(this.dzone.$el);
                this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
            }
        },

        loaded: function(fileList, name){
            $.post(webgnome.config.api + '/substance/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': GnomeOil.prototype.defaults().obj_type,
                 'name': name,
                 'session': localStorage.getItem('session')
                }
            ).done(_.bind(function(response) {
                var substance = new GnomeOil(JSON.parse(response), {parse: true});
                this.model = substance;
                webgnome.model.setGlobalSubstance(substance);
                this.renderSubstanceInfo();
                //this.hide();
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            );
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

        emulsionUpdate: function() {
            var substance = this.model;
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

        setEmulsificationOverride: function() {
            var substance = this.model;
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
            if (!this.model.get('is_weatherable')) {
                return;
            }
            var substance = this.model;
            var original_bullwinkle_fraction = substance.get('original_bullwinkle_fraction');
            var original_bullwinkle_time = substance.get('original_bullwinkle_time');
            substance.set('bullwinkle_fraction', original_bullwinkle_fraction);
            substance.set('bullwinkle_time', original_bullwinkle_time);
            this.renderSubstanceInfo(null, substance);
        },

        close: function() {
            if (this.dzone) {
                this.dzone.close();
            }

            FormModal.prototype.close.call(this);
        },

    });

    return oilUploadForm;
});
