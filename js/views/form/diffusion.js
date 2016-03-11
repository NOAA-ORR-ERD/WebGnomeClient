define([
    'jquery',
    'underscore',
    'backbone',
    'model/movers/random',
    'views/modal/form',
    'text!templates/form/diffusion.html'
], function($, _, Backbone, DiffusionModel, FormModal, DiffusionTemplate){
	'use strict';
	var diffusionForm = FormModal.extend({

		events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, diffusionModel) {
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(diffusionModel)){
                this.model = diffusionModel;
            } else {
                this.model = new DiffusionModel();
            }
        },

        render: function(options) {
            this.body = _.template(DiffusionTemplate, {
                name: this.model.get('name'),
                coeff: this.model.get('diffusion_coef'),
                uncertain: this.model.get('uncertain_factor')
            });
            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var name = this.$('#name').val();
            var coeff = this.$('#coeff').val();
            var uncertain_factor = this.$('#uncertain').val();

            this.model.set('name', name);
            this.model.set('diffusion_coef', coeff);
            this.model.set('uncertain_factor', uncertain_factor);

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        }
	});
	
	return diffusionForm;
});