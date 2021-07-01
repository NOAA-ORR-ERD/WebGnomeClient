define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'nucos',
    'views/modal/form',
    'text!templates/form/water.html',
    'model/environment/water',
], function($, _, Backbone, module, nucos,
            FormModal, WaterTemplate, WaterModel) {
    'use strict';
    var waterForm = FormModal.extend({
        className: 'modal form-modal model-form water-form',
        title: 'Water Properties',

        events: function() {
            return _.defaults({
                'change select': function(e) {
                    this.revealManualInputs(e);
                },
                'click .reset': 'resetSelect'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(model)) {
                this.model = model;
            }
            else {
                this.model = new WaterModel();
            }
        },

        render: function(options) {
            var water_temp = (this.model.isNew()) ? '' : this.model.get('temperature');

            this.body = _.template(WaterTemplate)({
                water_temp: water_temp,
                salinity: this.model.get('salinity')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#tempunits option[value="' + this.model.get('units').temperature + '"]')
                .prop('selected', 'selected');
            this.$('#wave_height-units option[value="' + this.model.get('units').wave_height + '"]')
                .prop('selected', 'selected');
            this.$('#fetch-units option[value="' + this.model.get('units').fetch + '"]')
                .prop('selected', 'selected');

            if (!_.isNull(this.model.get('fetch'))) {
                this.$('#data-source').val('fetch');
                this.$('#fetch').val(this.model.get('fetch'));
                this.$('.fetch').removeClass('hide');
            }

            if (!_.isNull(this.model.get('wave_height'))) {
                this.$('#data-source').val('specified');
                this.$('#height').val(this.model.get('wave_height'));
                this.$('.specified').removeClass('hide');
            }

            if ([0, 15, 32].indexOf(this.model.get('salinity')) === -1) {
                // one of the drop down options was not selected.
                this.$('.salinity-select').parent().addClass('hide');
                this.$('.salinity-input').removeClass('hide');
                this.$('.salinity-input input').val(this.model.get('salinity'));
                this.$('.salinity-reset').removeClass('hide');
            }
            else {
                this.$('.salinity-select option[value="' + this.model.get('salinity') + '"]')
                    .prop('selected', 'selected');
            }

            var unitsAreMgPerLiter = this.model.get('units').sediment === 'mg/l';

            if ([5, 50, 500].indexOf(this.model.get('sediment')) === -1 ||
                    !unitsAreMgPerLiter) {
                this.$('.sediment-select').parent().addClass('hide');
                this.$('.sediment-input').removeClass('hide');
                this.$('.sediment-input input').val(this.model.get('sediment'));
                this.$('.sediment-units option[value="' + this.model.get('units').sediment + '"]')
                    .prop('selected', 'selected');
                this.$('.sediment-reset').removeClass('hide');
            }
            else {
                this.$('.sediment-select option[value="' + this.model.get('sediment') + '"]')
                    .prop('selected', 'selected');
            }
        },

        convertTemptoK: function(val, unit) {
            val = parseFloat(val);
            var temp = val;

            if (unit === 'F') {
                temp = (5 / 9) * (val - 32) + 273.15;
            }
            else if (unit === 'C') {
                temp += 273.15;
            }

            return temp;
        },

        triggerInputs: function(){
            this.$('#data-source').trigger('change');
        },

        convertHeighttoKM: function(val, unit) {
            val = parseFloat(val, 10);
            var height = val;

            height = unit === 'm' ? height / 1000 : height / 3280.8;

            return height;
        },

        update: function() {
            var units = this.model.get('units');

            units.temperature = this.$('#tempunits').val();
            units.sediment = this.$('.sediment-units').val();

            this.model.set('fetch', null);
            this.model.set('wave_height', null);

            if (this.$('#data-source').val() === 'fetch') {
                this.model.set('fetch', this.$('#fetch').val());
                units.fetch = this.$('#fetch-units').val();
            }

            if (this.$('#data-source').val() === 'specified' ||
                    this.$('#data-source').val() === 'river') {
                this.model.set('wave_height', this.$('#height').val());
                units.wave_height = this.$('#wave_height-units').val();
            }

            this.model.set('units', units);
            this.model.set('temperature', this.$('#temp').val());
            this.model.set('salinity', this.$('.salinity:visible').val());
            this.model.set('sediment', this.$('.sediment:visible').val());
        },

        resetSelect: function(e) {
            if (this.$(e.currentTarget).is('a')) {
                e.currenttarget = this.$(e.currentTarget).parent();
            }

            this.$(e.currentTarget).siblings('div').toggleClass('hide');
            this.$(e.currentTarget).addClass('hide');
            this.$(e.currentTarget).siblings().children('select')
                .prop("selectedIndex", 0);

            this.update();
        },

        revealManualInputs: function(e) {
            var value = e.currentTarget.value;

            // special case for when a user selects selinity/sediment number in select or units for temp
            if (value.match(/\d*/)[0] !== '' ||
                    ['km', 'mi', 'ft', 'm'].indexOf(value) !== -1 ||
                    ['K', 'C', 'F'].indexOf(value) !== -1 ||
                    $(e.currentTarget).hasClass('sediment-units')) {
                this.update(e);
            }

            // for water sediment/salinity other select
            if (value === 'other') {
                this.$(e.currentTarget).parent().addClass('hide');
                this.$(e.currentTarget).parent().siblings('.hide').removeClass('hide');
            }

            if (['fetch', 'specified', 'river'].indexOf(value) !== -1) {
                this.$('.fetch, .specified, .water-warn').addClass('hide');

                this.$(e.currentTarget).parents('.form-group')
                    .siblings('.' + value)
                    .removeClass('hide');

                if (value === 'fetch') {
                    //this.model.set('fetch', '');
                    this.model.set('wave_height', null);
                }
                else if (value === 'specified' || value === 'river') {
                    //this.model.set('wave_height', '');
                    this.model.set('fetch', null);

                    if (value === 'river') {
                        this.$('.specified').removeClass('hide');
                        this.$('.water-warn').removeClass('hide');
                    }
                }
            }
            else if (value === 'windcalc') {
                this.$('.fetch, .specified, .water-warn').addClass('hide');
                this.model.set('wave_height', null);
                this.model.set('fetch', null);
            }
        }
    });

    return waterForm;
});
