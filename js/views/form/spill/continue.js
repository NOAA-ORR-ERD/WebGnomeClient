define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/form/spill/base',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider',
    'moment'
], function($, _, Backbone, module, moment, BaseSpillForm, FormTemplate, SpillModel, OilLibraryView, SpillMapView){
    'use strict';
    var continueSpillForm = BaseSpillForm.extend({
        title: 'Continuous Release',
        className: 'modal form-modal spill-form continuespill-form',
        loaded: false,

        events: function(){
            return _.defaults({}, BaseSpillForm.prototype.events());
        },

        initialize: function(options, spillModel){
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            this.model = spillModel;
            this.model.get('element_type').fetch({
                success: _.bind(function(model, response, options){
                    this.oilDetails = model;
                    this.loaded = true;
                    this.model.trigger('ready');
                }, this)
            });
        },

        render: function(options){
            if (this.loaded){
                var startPosition = this.model.get('release').get('start_position');
                var endPosition = this.model.get('release').get('end_position');
                var amount = this.model.get('amount');
                var duration = this.model.parseDuration();
                var units = this.model.get('units');
                var oil = this.oilDetails.get('substance') ? this.oilDetails.get('substance') : '';
                var disabled = this.oilSelectDisabled();
                var cid = this.model.cid;
                this.body = _.template(FormTemplate, {
                    name: this.model.get('name'),
                    amount: amount,
                    time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                    'duration': duration,
                    showGeo: this.showGeo,
                    showSubstance: this.showSubstance,
                    disabled: disabled,
                    cid: cid
                });
                BaseSpillForm.prototype.render.call(this, options);

                var durationObj = moment.duration((parseInt(duration.days, 10) * 24) + parseInt(duration.hours, 10), 'h');

                var rate;
                if ((this.$('#rate-units').val()).indexOf('hr') === -1){
                    rate = parseFloat(amount) / durationObj.asDays();
                } else {
                    rate = parseFloat(amount) / durationObj.asHours();
                }

                this.$('#spill-rate').val(rate);

                if (!_.isUndefined(units)){
                    this.$('#rate-units').val(units + '/hr');
                } else {
                    var amountUnits = this.$('#units').val();
                    this.$('#rate-units').val(amountUnits + '/hr');
                }

                this.$('.slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="amount-tooltip" class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateAmountSlide(ui);
                    }, this)
                });

                if (!this.model.isNew()){
                    this.$('.slider').slider("option", "value", this.model.get('amount_uncertainty_scale') * 5);
                    this.updateAmount();
                    this.updateRate();
                }

                this.updateAmountSlide();

            } else {
                this.model.on('ready', this.render, this);
            }
        },

        update: function(e){
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
            var amount = parseFloat(this.$('#spill-amount').val());
            if (isNaN(amount)){
                amount = 0;
            } else {
                this.$('#spill-amount').val(amount);
            }
            var release = this.model.get('release');
            var units = this.$('#units').val();
            var startPosition = release.get('start_position');
            var endPosition = release.get('end_position');
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;

            var duration = (((parseInt(days, 10) * 24) + parseFloat(hours, 10)) * 60) * 60;
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.add(duration, 's').format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('name', name);
            this.model.set('units', units);
            this.model.set('amount', amount);
            this.model.set('release', release);
            BaseSpillForm.prototype.update.call(this);
            if (!_.isUndefined(e)) {
                this.inputFieldUpdate(e);
            }
            var value = this.$('.slider').slider('value');
            this.model.set('amount_uncertainty_scale', value / 5);
        },

        inputFieldUpdate: function(e) {
            var rateChanged = this.$(e.currentTarget).is('#spill-rate') || this.$(e.currentTarget).is('#rate-units');
            var amountChanged = this.$(e.currentTarget).is('#spill-amount') || this.$(e.currentTarget).is('#units');
            var durationChanged = this.$(e.currentTarget).is('#days') || this.$(e.currentTarget).is('#hours');

            if (rateChanged) {
                this.updateAmount();
            } else if (amountChanged || durationChanged) {
                this.updateRate();
            }
        },

        updateRate: function(){
            var amount = parseFloat(this.$('#spill-amount').val());
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            this.rate = amount / duration;
            var units = this.$('#units').val();
            if (units === 'bbl' && this.rate % 24 === 0) {
                this.$('#spill-rate').val(this.rate / 24);
                this.$('#rate-units').val('bbl/day');
            } else {
                this.$('#spill-rate').val(this.rate);
                this.$('#rate-units').val(units + '/hr');
            }
            this.updateAmountSlide();
        },

        updateAmount: function(){
            if(this.$('#rate-units').val() !== ''){
                this.rate = parseFloat(this.$('#spill-rate').val());
                var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
                var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
                var duration = ((days * 24) + parseFloat(hours));
                var amount;
                if (this.$('#rate-units').val() === 'bbl/day'){
                    amount = this.rate * duration / 24;
                } else {
                    amount = this.rate * duration;
                }
                this.$('#spill-amount').val(amount);
                this.model.set('amount', amount);
                var units = this.$('#rate-units').val().split('/')[0];
                this.$('#units').val(units);
                this.updateAmountSlide();
            }
        },

        updateAmountSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('.slider').slider('value');
            }
            if(this.model.get('amount') !== 0){
                var amount = this.model.get('amount');
                if(value === 0){
                    this.$('#amount-tooltip').text(amount);
                } else {
                    var bottom = parseInt(Math.round((amount * (1 - ((value / 25.0) * 5)))), 10);
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(Math.round((amount * (1 + ((value / 25.0) * 5)))), 10);
                    this.$('#amount-tooltip').text(bottom + ' - ' + top);
                }
            }
            this.updateTooltipWidth();
        },

        close: function(){
            this.model.off('ready', this.render, this);
            BaseSpillForm.prototype.close.call(this);
        }

    });

    return continueSpillForm;
});