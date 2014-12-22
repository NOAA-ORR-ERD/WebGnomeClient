define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'nucos',
    'views/modal/form',
    'text!templates/form/water.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, nucos, FormModal, WaterTemplate){
    var waterForm = FormModal.extend({
        className: 'modal fade form-modal model-form',
        title: 'Water Properties',

        events: function(){
            return _.defaults({
                'change select': 'revealManualInputs',
            }, FormModal.prototype.events);
        },

        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(WaterTemplate, {
                water_temp: this.model.get('temperature')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#tempunits option[value="' + this.model.get('units').temperature + '"]').attr('selected', 'selected');
            this.$('#wave_height-units option[value="' + this.model.get('units').wave_height + '"]').attr('selected', 'selected');

            if (this.model.get('fetch')){
                this.$('#data-source').val('fetch');
                this.$('#fetch').val(this.model.get('fetch'));
            }
            if (this.model.get('wave_height')){
                this.$('#data-source').val('specified');
                this.$('#height').val(this.model.get('wave_height'));
            }
            
            if ([0, 15, 32].indexOf(this.model.get('salinity')) == -1){
                // one of the drop down options was not selected.
                this.$('.salinity-select').parent().hide();
                this.$('.salinity-input').removeClass('hide');
                this.$('.salinity-input input').val(this.model.get('salinity'));
            } else {
                this.$('.salinity-select option[value="' + this.model.get('salinity') + '"]').attr('selected', 'selected');
            }

            if ([5, 50, 500].indexOf(this.model.get('sediment')) == -1){
                this.$('.sediment-select').parent().hide();
                this.$('.sediment-input').removeClass('hide');
                this.$('.sediment-input input').val(this.model.get('sediment'));
            } else {
                this.$('.sediment-select option[value="' + this.model.get('sediment') + '"]').attr('selected', 'selected');
            }
        },

        convertTemptoK: function(val, unit){
            val = parseFloat(val);
            var temp = val;
            if (unit === 'F'){
                temp = (5/9) * (val - 32) + 273.15;
            } else if (unit === 'C'){
                temp += 273.15;
            }

            return temp;
        },

        ready: function(){
            FormModal.prototype.ready.call(this);
            this.triggerInputs();
        },

        triggerInputs: function(){
            this.$('#data-source').trigger('change');
        },

        convertHeighttoKM: function(val, unit){
            val = parseFloat(val, 10);
            var height = val;
            height = unit === 'm' ? height / 1000 : height / 3280.8;
            return height;
        },

        update: function(){
            var units = this.model.get('units');
            units.temperature = this.$('#tempunits').val();
            this.model.set('fetch', 0);
            this.model.set('wave_height', 0);
            if (this.$('#data-source').val() === 'fetch'){
                this.model.set('fetch', this.$('#fetch').val());
                units.fetch = this.$('#fetch-units').val();
            }
            if (this.$('#data-source').val() === 'specified'){
                this.model.set('wave_height', this.$('#height').val());
                units.wave_height = this.$('#wave_height-units').val();
            }
            this.model.set('units', units);
            this.model.set('temperature', this.$('#temp').val());
            this.model.set('salinity', this.$('.salinity:visible').val());
            this.model.set('sediment', this.$('.sediment:visible').val());
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        revealManualInputs: function(e){
            var value = e.currentTarget.value;
            if (value === 'other'){
                this.$(e.currentTarget).parent().addClass('hide');
                this.$(e.currentTarget).parent().siblings('.hide').removeClass('hide');
            }
            if (['fetch', 'specified'].indexOf(value) !== -1) {
                this.$('.fetch, .specified').addClass('hide');
                this.$(e.currentTarget).parents('.form-group').siblings('.' + value).removeClass('hide');
            } else if (value === 'windcalc') {
                this.$('.fetch, .specified').addClass('hide');
            }
            this.update();
        }

    });

    return waterForm;
});