define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/form/spill/base',
    'text!templates/form/spill/instant.html',
    'model/spill/spill',
    'views/form/oil/library',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment,
            BaseSpillForm, FormTemplate, SpillModel,
            OilLibraryView) {
    'use strict';
    var instantSpillForm = BaseSpillForm.extend({
        title: 'Instantaneous Release',
        className: 'modal form-modal spill-form instantspill-form',

        initialize: function(options, spillModel) {
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            }
            else {
                this.model = spillModel;
            }
        },

        render: function(options) {
            if (this.model.get('name') === 'Spill') {
                var spillsArray = webgnome.model.get('spills').models;

                for (var i = 0; i < spillsArray.length; i++) {
                    if (spillsArray[i].get('id') === this.model.get('id')) {
                        var nameStr = 'Spill #' + (i + 1);
                        this.model.set('name', nameStr);
                        break;
                    }
                }
            }

            var startPosition = this.model.get('release').get('start_position');
            var endPosition = this.model.get('release').get('end_position');

            var disabled = this.oilSelectDisabled();
            var cid = this.model.cid;

            var releaseTime;
            if (!_.isNull(this.model.get('release').get('release_time'))) {
                releaseTime = moment(this.model.get('release').get('release_time'));
            }
            else {
                releaseTime = moment(webgnome.model.get('start_time'));
            }

            releaseTime = releaseTime.format('YYYY/M/D H:mm:ss');

            this.body = _.template(FormTemplate)({
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: releaseTime,
                showGeo: this.showGeo,
                showSubstance: this.showSubstance,
                disabled: disabled,
                cid: cid
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

            if (!this.model.isNew()) {
                this.$('.slider').slider("option", "value",
                                         this.model.get('amount_uncertainty_scale') * 5);
                this.updateConstantSlide();
            }
        },

        update: function() {
            var name = this.$('#name').val();
            this.model.set('name', name);

            var amount = parseFloat(this.$('#spill-amount').val());
            var units = this.$('#units').val();

            var release = this.model.get('release');

            var releaseTime = (moment(this.$('#datetime').val(),
                                      'YYYY/M/D H:mm:ss')
                               .format('YYYY-MM-DDTHH:mm:ss'));

            this.model.set('name', name);
            this.model.set('units', units);
            this.model.set('amount', amount);

            release.set('release_time', releaseTime);
            release.set('end_release_time', releaseTime);

            BaseSpillForm.prototype.update.call(this);

            this.updateConstantSlide();
            var value = this.$('.slider').slider('value');
            this.model.set('amount_uncertainty_scale', value / 5.0);
        },

        updateConstantSlide: function(ui) {
            var slider_min = this.$( ".slider" ).slider( "option", "min" );
            var slider_max = this.$( ".slider" ).slider( "option", "max" );
            var slider_scale = slider_max - slider_min;
            var value;

            if (_.isUndefined(ui)) {
                value = this.$('.slider').slider('value') - slider_min;
            }
            else {
                value = ui.value - slider_min;
            }

            if (this.model.get('amount') !== 0) {
                var amount = this.model.get('amount');

                if (value === 0) {
                    this.$('.slider .tooltip-inner').text(amount);
                }
                else {
                    var sigma = value / slider_scale * (2.0 / 3.0) * amount;
                    var bottom = Math.round(amount - sigma);
                    var top = Math.round(amount + sigma);

                    this.$('.slider .tooltip-inner').text(bottom + ' - ' + top);
                }
            }

            this.updateTooltipWidth();
        }

    });

    return instantSpillForm;
});
