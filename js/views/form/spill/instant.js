define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/spill/base',
    'text!templates/form/spill/instant.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'jqueryDatetimepicker',
    'moment'
], function($, _, Backbone, module, BaseSpillForm, FormTemplate, SpillModel, OilLibraryView, SpillMapView){
    var instantSpillForm = BaseSpillForm.extend({
        title: 'Instantaneous Release',
        className: 'modal fade form-modal instantspill-form',

        initialize: function(options, spillModel){
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            if (!_.isUndefined(options.model)){
                this.model = options.model;
            } else {
                this.model = spillModel;
            }
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

            var startPosition = this.model.get('release').get('start_position');
            var endPosition = this.model.get('release').get('end_position');
            var disabled = this.oilSelectDisabled();
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                showGeo: this.showGeo,
                showSubstance: this.showSubstance,
                start_coords: {'lat': startPosition[1], 'lon': startPosition[0]},
                end_coords: {'lat': endPosition[1], 'lon': endPosition[0]},
                disabled: disabled
            });
            BaseSpillForm.prototype.render.call(this, options);
            this.$('.slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateConstantSlide(ui);
                }, this)
            });

            if (!this.model.isNew()){
                this.$('.slider').slider("option", "value", this.model.get('amount_uncertainty_scale') * 5);
                this.updateConstantSlide();
            }
        },

        update: function(){
            var name = this.$('#name').val();
            this.model.set('name', name);
            var amount = parseInt(this.$('#spill-amount').val(), 10);
            var units = this.$('#units').val();
            var release = this.model.get('release');
            var startPosition = release.get('start_position');
            var endPosition = release.get('end_position');
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            var startLat = this.$('#start-lat').val() ? this.$('#start-lat').val() : '0';
            var startLon = this.$('#start-lon').val() ? this.$('#start-lon').val() : '0';
            var endLat = this.$('#end-lat').val() ? this.$('#end-lat').val() : '0';
            var endLon = this.$('#end-lon').val() ? this.$('#end-lon').val() : '0';

            var start_position = [parseFloat(startLon), parseFloat(startLat), 0];
            var end_position = [parseFloat(endLon), parseFloat(endLat), 0];

            release.set('start_position', start_position);
            release.set('end_position', end_position);
            this.model.set('name', name);
            this.model.set('release', release);
            this.model.set('units', units);
            this.model.set('amount', amount);
            release.set('release_time', releaseTime);
            release.set('end_release_time', releaseTime);
            BaseSpillForm.prototype.update.call(this);
            this.updateConstantSlide();
        },

        updateConstantSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('.slider').slider('value');
            }
            if(this.model.get('amount')){
                var amount = this.model.get('amount');
                if(value === 0){
                    this.$('.tooltip-inner').text(amount);
                } else {
                    var bottom = parseInt(Math.round((amount * (1 - ((value / 25.0) * 5)))), 10);
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(Math.round((amount * (1 + ((value / 25.0) * 5)))), 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
            this.model.set('amount_uncertainty_scale', value / 5);
            this.updateTooltipWidth();
        }

    });

    return instantSpillForm;
});