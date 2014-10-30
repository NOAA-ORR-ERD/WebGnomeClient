define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui/core',
    'views/modal/form',
    'text!templates/risk/tuning.html',
], function($, _, Backbone, jqueryui, FormModal, RiskTemplate) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-info run">Run</button>',

        events: function() {
            return _.defaults({
                'shown.bs.modal': 'triggerInputs',
		'click .run': 'run'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(RiskTemplate, {
                surface: this.model.get('surface'),
                column: this.model.get('column'),
                shoreline: this.model.get('shoreline'),
            });

            FormModal.prototype.render.call(this, options);

            this.createSlider('.slider-skimming', this.model.get('efficiency').skimming);
            this.createSlider('.slider-dispersant', this.model.get('efficiency').dispersant);
            this.createSlider('.slider-in-situ-burn', this.model.get('efficiency').insitu_burn);
        },

        createSlider: function(selector, value){
            this.$(selector).slider({
                    max: 100,
                    min: 0,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.update();
                        }, this)
            });
        },

        update: function(){
            var efficiency = this.model.get('efficiency');
            efficiency.skimming = this.$('.slider-skimming').slider('value');
            efficiency.dispersant = this.$('.slider-dispersant').slider('value');
            efficiency.insitu_burn = this.$('.slider-in-situ-burn').slider('value');
console.log('sliding!!!!!', efficiency.skimming, efficiency.dispersant, efficiency.insitu_burn);

            this.model.set('surface', parseFloat(this.$('#surface').val()));
            this.model.set('column', parseFloat(this.$('#column').val()));
            this.model.set('shoreline', parseFloat(this.$('#shoreline').val()));
            
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        run: function(){
console.log('continuing on to running assessment');
            FormModal.prototype.close.call(this);
            this.trigger('wizardclose');
        },

        triggerInputs: function(){
            this.$('#data-source').trigger('change');
        }

    });

    return riskForm;
});
