define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/form/spill/base',
    'text!templates/form/spill/continue.html',
    'model/spill/spill',
    'views/form/oil/library',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, Backbone, module, moment, BaseSpillForm, ContinueFormTemplate, SpillModel, OilLibraryView){
    'use strict';
    var continueSpillForm = BaseSpillForm.extend({
        title: 'Point or Line Release',
        className: 'modal form-modal spill-form continuespill-form',
        loaded: false,

        events: function(){
            return _.defaults({}, BaseSpillForm.prototype.events());
        },

        initialize: function(options, spillModel){
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            this.model = spillModel;
            this.loaded = true;
            this.model.trigger('ready');
        },

        render: function(options){
            if (this.loaded){
                var amount = this.model.get('amount');
                var duration = this.model.parseDuration();
                var units = this.model.get('units');
                var disabled = this.oilSelectDisabled();
                var cid = this.model.cid;
                var durationObj = moment.duration((parseFloat(duration.days, 10) * 24) + parseFloat(duration.hours, 10), 'h');
                var release_timesteps = (durationObj.asSeconds()/webgnome.model.get('time_step'));
                var num_elements = this.model.get('release').get('num_elements');
                var min_LEs;
                if (num_elements < release_timesteps) {
                    min_LEs = 'Less than 1 per timestep';
                } else if (duration.days === 0 && duration.hours === 0) {
                    min_LEs = 'Instantaneous release';
                } else {
                    min_LEs = '~' + Math.ceil(num_elements/release_timesteps) + ' per timestep';
                }
                this.body = _.template(ContinueFormTemplate, {
                    name: this.model.get('name'),
                    amount: amount,
                    time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                    'duration': duration,
                    num_elements: num_elements,
                    release_timesteps: release_timesteps,
                    min_LEs: min_LEs,
                    showGeo: this.showGeo,
                    showSubstance: this.showSubstance,
                    disabled: disabled,
                    cid: cid
                });
                BaseSpillForm.prototype.render.call(this, options);

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
            var num_elements = this.$('#num_elements').val();
            var duration = (((parseInt(days, 10) * 24) + parseFloat(hours, 10)) * 60) * 60;
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.add(duration, 's').format('YYYY-MM-DDTHH:mm:ss'));
            release.set('num_elements', num_elements);
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
            var LEsChanged = this.$(e.currentTarget).is('#num_elements');
            
            if (rateChanged) {
                this.updateAmount();
            } else if (amountChanged) {
                this.updateRate();
            } else if (durationChanged) {
                this.updateRate();
                this.updateMinLE();
            } else if (LEsChanged) {
                this.updateMinLE();
            }
        },
        
        updateMinLE: function(){
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            var num_elements = this.$('#num_elements').val();
            var release_timesteps = (duration * 3600) / webgnome.model.get('time_step');
            var min_LEs;
            if (duration === 0) {
                min_LEs = 'Instaneous release';
            } else {
                min_LEs = '~' + Math.ceil(num_elements/release_timesteps) + ' per timestep';
            }
            if (num_elements >= release_timesteps) {
                this.$('#min_LEs').text(min_LEs);
                document.getElementById("min_LEs").className = "label label-info";
            } else {
                this.$('#min_LEs').text('Less than 1 per timestep');
                document.getElementById("min_LEs").className = "label label-danger";
            }
        },

        updateRate: function(){
            var amount = parseFloat(this.$('#spill-amount').val());
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            if (duration > 0) {
                this.$('#spill-rate').attr('disabled', null);
            } else {
                this.$('#spill-rate').attr('disabled', 'disabled');
            }
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
                var amount;
                if (_.isNaN(this.rate)) {
                    amount = this.model.get('amount');
                } else {
                    var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
                    var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
                    var duration = ((days * 24) + parseFloat(hours));
                    if (this.$('#rate-units').val() === 'bbl/day'){
                        amount = this.rate * duration / 24;
                    } else {
                        amount = this.rate * duration;
                    }
                }
                this.$('#spill-amount').val(amount);
                this.model.set('amount', amount);
                var units = this.$('#rate-units').val().split('/')[0];
                this.$('#units').val(units);
                this.updateAmountSlide();
            }
        },

        updateAmountSlide: function(ui){
            var slider_min = this.$( ".slider" ).slider( "option", "min" );
            var slider_max = this.$( ".slider" ).slider( "option", "max" );
            var slider_scale = slider_max - slider_min;
            var value;

            if(_.isUndefined(ui)){
                value = this.$('.slider').slider('value') - slider_min;
            } else {
                value = ui.value - slider_min;
            }

            if(this.model.get('amount') !== 0) {
                var amount = this.model.get('amount');

                if(value === 0){
                    this.$('#amount-tooltip').text(amount);
                } else {
                    var sigma = value / slider_scale * (2.0 / 3.0) * amount;
                    var bottom = Math.round(amount - sigma);
                    var top = Math.round(amount + sigma);

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