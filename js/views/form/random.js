define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/random.html'
], function($, _, Backbone, FormModal, FormTemplate){
	   var randomForm = FormModal.extend({
      title: 'Diffusion Settings',
      className: 'modal fade form-modal',
      events: function(){
          return _.defaults({

          }, FormModal.prototype.events);
      },
		  initialize: function(options, GnomeRandom){
           FormModal.prototype.initialize.call(this, options);
           this.model = GnomeRandom;
      },

      render: function(options){
        this.body = _.template(FormTemplate, {
          name: this.model.get('name'),
          diffusion_coef: this.model.get('diffusion_coef'),
          uncertain_factor: this.model.get('uncertain_factor')
        });
        
        FormModal.prototype.render.call(this, options);

        if (this.model.get('on')) {
          this.$('input[name="active"]').prop('checked', true);
        } 

      },

      update: function() {
        var mover_name = this.$('#name').val();
        this.model.set('name', mover_name);

        var diffusion_coef = this.$('#diffusCoef').val();
        this.model.set('diffusion_coef', diffusion_coef);

        var uncertain_factor = this.$('#uncertFact').val();
        this.model.set('uncertain_factor', uncertain_factor);
      }
	});
	   return randomForm;
});