define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'model/movers/random',
    'views/modal/form',
    'text!templates/form/diffusion.html'
], function($, _, Backbone, module, DiffusionModel, FormModal, DiffusionTemplate){
	'use strict';
	var diffusionForm = FormModal.extend({
        title: 'Horizontal Diffusion',

		events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, diffusionModel) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(diffusionModel)){
                this.model = diffusionModel;
            } else {
                this.model = new DiffusionModel();
            }
            
            if (!this.model.get('name')) {
                var count = webgnome.model.get('movers').where({obj_type: this.model.get('obj_type')});
                count = !count ? 1 : count.length + 1;
                this.model.set('name', 'Diffusion #' + count);
            }
        },

        render: function(options) {
            this.body = _.template(DiffusionTemplate, {
                name: this.model.get('name'),
                coeff: this.model.get('diffusion_coef').toExponential(2),
                uncertain: this.model.get('uncertain_factor')
            });
            FormModal.prototype.render.call(this, options);
        },

        update: function() {
            var name = this.$('#name').val();
            var coeff = parseFloat(this.$('#coeff').val());
            var uncertain_factor = parseFloat(this.$('#uncertain').val());

            this.model.set('name', name);
            this.model.set('diffusion_coef', coeff);
            this.model.set('uncertain_factor', uncertain_factor);
        }
	});
	
	return diffusionForm;
});