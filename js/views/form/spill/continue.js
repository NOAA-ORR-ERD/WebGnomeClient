define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'jqueryDatetimepicker',
    'jqueryui/slider',
    'moment'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel){
    var continueSpillForm = FormModal.extend({
        title: 'Continuous Release',
        className: 'modal fade form-modal continuespill-form',

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, spillModel){
            this.model = spillModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            FormModal.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });

            if (!this.model.get('amount')){
                this.model.set('amount', 0);
            }

            if (!this.model.get('rate')){
                this.model.set('rate', 0);
            }

            this.$('#amount .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('#amount .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateAmountSlide(ui);
                }, this)
            });

            this.$('#constant .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('#constant .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('rate') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateRateSlide(ui);
                }, this)
            });
        },

        update: function(){
            var amount = this.$('#spill-amount').val();
            var rate = this.$('#spill-rate').val();
            var release = this.model.get('release');
            var units = this.$('#units').val();
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var days = this.$('#days').val().trim();
            var hours = this.$('#hours').val().trim();

            if (days === '') {
                days = 0;
            }

            if (hours === '') {
                hours = 0;
            }

            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            release.set('release_time', releaseTime.format());
            release.set('end_release_time', releaseTime.add(duration, 's').format());
            this.model.set('amount', amount);
            this.model.set('release', release);
            this.model.set('units', units);
            this.updateAmountSlide();
            this.updateRateSlide();

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
            console.log(this.model.toJSON());
        },

        updateAmountSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#amount .slider').slider('value');
            }
            if(this.model.get('amount') !== 0){
                var amount = this.model.get('amount');
                if(value === 0){
                    this.$('.active .tooltip-inner').text(amount);
                } else {
                    var bottom = amount - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(amount, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
            
        },

        updateRateSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#constant .slider').slider('value');
            }
            if(this.model.get('rate')){
                var amount = this.model.get('rate');
                if(value === 0){
                    this.$('.active .tooltip-inner').text(amount);
                } else {
                    var bottom = amount - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(amount, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
        }

    });

    return continueSpillForm;
});