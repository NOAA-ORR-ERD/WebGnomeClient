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
        this.body = _.template(FormTemplate);
        
        FormModal.prototype.render.call(this, options);

        this.form['name'] = this.$('#name');
        this.form['active'] = this.$('#active'); // need to finish this one
        this.form['diffusion_coef'] = this.$('#diffusCoef');
        this.form['uncertain_factor'] = this.$('#uncertFact');
      }
	});
	   return randomForm;
});