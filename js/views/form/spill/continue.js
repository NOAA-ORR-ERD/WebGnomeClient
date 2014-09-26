define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'jqueryDatetimepicker',
    'jqueryui/slider',
    'moment'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel, OilLibraryView, SpillMapView){
    var continueSpillForm = FormModal.extend({
        title: 'Continuous Release',
        className: 'modal fade form-modal continuespill-form',

        events: function(){
            return _.defaults({
                'click .oilSelect': 'elementSelect',
                'click .locationSelect': 'locationSelect'
            }, FormModal.prototype.events);
        },

        initialize: function(options, spillModel){
            FormModal.prototype.initialize.call(this, options);
            this.model = spillModel;
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
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: _.isNull(this.model.get('release').get('release_time')) ? moment().format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                duration: {days: 0, hours: 0}
            });
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
            var name = this.$('#name').val();
            this.model.set('name', name);
            if (name === 'Spill'){
                var spillsArray = webgnome.model.get('spills').models;
                for (var i = 0; i < spillsArray.length; i++){
                    if (spillsArray[i].get('id') === this.model.get('id')){
                        var nameStr = 'Spill #' + (i + 1);
                        this.model.set('name', nameStr);
                        break;
                    }
                }
            }
            var amount = parseInt(this.$('#spill-amount').val(), 10);
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
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.add(duration, 's').format('YYYY-MM-DDTHH:mm:ss'));
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
        },

        // parseDuration: function(seconds){
        //     if (!_.isUndefined(this.model.get('release')))
        // },

        elementSelect: function(){
            FormModal.prototype.hide.call(this);
            var oilLibraryView = new OilLibraryView();
            oilLibraryView.render();
        },

        locationSelect: function(){

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
            FormModal.prototype.close.call(this);
        }
    });

    return continueSpillForm;
});