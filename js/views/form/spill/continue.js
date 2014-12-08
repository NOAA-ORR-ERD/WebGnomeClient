define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/spill/base',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'jqueryDatetimepicker',
    'jqueryui/slider',
    'moment'
], function($, _, Backbone, module, BaseSpillForm, FormTemplate, SpillModel, OilLibraryView, SpillMapView){
    var continueSpillForm = BaseSpillForm.extend({
        title: 'Continuous Release',
        className: 'modal fade form-modal continuespill-form',
        ready: false,

        events: function(){
            return _.defaults({
                'blur #spill-amount': 'updateRate',
                'blur #spill-rate': 'updateAmount',
                'blur #rate-units': 'updateAmount',
                'blur #units': 'updateRate',
                'click #amount': 'updateAmountTooltip',
                'click #constant': 'updateRateTooltip'
            }, BaseSpillForm.prototype.events());
        },

        initialize: function(options, spillModel){
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            this.model = spillModel;
            this.model.get('element_type').fetch({
                success: _.bind(function(model, response, options){
                    this.oilDetails = model;
                    this.ready = true;
                    this.trigger('ready');
                }, this)
            });
        },

        render: function(options){
            if (this.ready){
                var startPosition = this.model.get('release').get('start_position');
                var endPosition = this.model.get('release').get('end_position');
                var amount = this.model.get('amount');
                var duration = this.parseDuration(this.model.get('release').get('release_time'), this.model.get('release').get('end_release_time'));
                var units = this.model.get('units');
                var oil = this.oilDetails.get('substance') ? this.oilDetails.get('substance') : '';
                this.body = _.template(FormTemplate, {
                    name: this.model.get('name'),
                    amount: amount,
                    time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                    duration: duration,
                    showGeo: this.showGeo,
                    start_coords: {'lat': startPosition[1], 'lon': startPosition[0]},
                    end_coords: {'lat': endPosition[1], 'lon': endPosition[0]}
                });
                BaseSpillForm.prototype.render.call(this, options);
                this.renderOilInfo();
                var durationInMins = (((parseInt(duration.days, 10) * 24) + parseInt(duration.hours, 10)) * 60);
                var rate = parseFloat(amount) / durationInMins;

                this.$('#spill-rate').val(rate);

                if (!_.isUndefined(units)){
                    this.$('#rate-units').val(units + '/hr');
                } else {
                    var amountUnits = this.$('#units').val();
                    this.$('#rate-units').val(amountUnits + '/hr');
                }

                this.$('#amount .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('#amount .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="amount-tooltip" class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
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
                        this.$('#constant .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="rate-tooltip" class="tooltip-inner">' + 0 + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateRateSlide(ui);
                    }, this)
                });
            } else {
                this.on('ready', this.render, this);
            }
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
            var startLat = this.$('#start-lat').val() ? this.$('#start-lat').val() : '0';
            var startLon = this.$('#start-lon').val() ? this.$('#start-lon').val() : '0';
            var endLat = this.$('#end-lat').val() ? this.$('#end-lat').val() : '0';
            var endLon = this.$('#end-lon').val() ? this.$('#end-lon').val() : '0';

            var start_position = [parseFloat(startLon), parseFloat(startLat), 0];
            var end_position = [parseFloat(endLon), parseFloat(endLat), 0];
            if (end_position[0] === 0 && end_position[1] === 0){
                this.$('#end-lat').val(startLat);
                this.$('#end-lon').val(startLon);
            }
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            release.set('start_position', start_position);
            release.set('end_position', end_position);
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.add(duration, 's').format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('name', name);
            this.model.set('units', units);
            this.model.set('amount', amount);
            this.model.set('release', release);
            BaseSpillForm.prototype.update.call(this);
            this.updateAmountSlide();
            this.updateRateSlide();
        },

        updateRate: function(){
            var amount = parseFloat(this.$('#spill-amount').val());
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            this.rate = amount / duration;
            var units = this.$('#units').val();
            this.$('#spill-rate').val(this.rate);
            this.$('#rate-units').val(units + '/hr');
            this.updateRateSlide();
            this.updateAmountSlide();
        },

        updateAmount: function(){
            this.rate = parseFloat(this.$('#spill-rate').val());
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            var amount = this.rate * duration;
            this.$('#spill-amount').val(amount);
            var units = this.$('#rate-units').val().split('/')[0];
            this.$('#units').val(units);
            this.updateAmountSlide();
            this.updateRateSlide();
        },

        parseDuration: function(start, end){
            var duration = (moment(end).unix() - moment(start).unix()) * 1000;
            var days = 0;
            var hours = 0;
            if (!_.isUndefined(duration)){
                hours = moment.duration(duration).asHours();
                if (hours >= 24){
                    days = parseInt(moment.duration(duration).asDays(), 10);
                }
                hours = hours - (days * 24);
            }
            return {'days': days, 'hours': hours};
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
                    this.$('#amount-tooltip').text(amount);
                } else {
                    var bottom = parseInt(Math.round((amount * (1 - ((value / 100.0) * 5)))), 10);
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(Math.round((amount * (1 + ((value / 100.0) * 5)))), 10);
                    this.$('#amount-tooltip').text(bottom + ' - ' + top);
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
            if(!_.isUndefined(this.rate)){
                var amount = this.rate ? this.rate : 0;
                if(value === 0){
                    this.$('#rate-tooltip').text(amount);
                } else {
                    var bottom = parseInt(Math.round((amount * (1 - ((value / 100.0) * 5)))), 10);
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(Math.round((amount * (1 + ((value / 100.0) * 5)))), 10);
                    this.$('#rate-tooltip').text(bottom + ' - ' + top);
                }
            }
        },

        updateAmountTooltip: function(){
            this.update();
            this.updateAmountSlide();
        },

        updateRateTooltip: function(){
            this.update();
            this.updateRateSlide();
        }

    });

    return continueSpillForm;
});