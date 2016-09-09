define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/random.html'
], function($, _, Backbone, FormModal, FormTemplate){
     'use strict';
     var randomForm = FormModal.extend({
      title: 'Diffusion Settings',
      className: 'modal form-modal',
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

        /* Checks to see if the Random mover object is active and if so
        * checks the checkbox to indicate that on modal render
        */
        if (this.model.get('on')) {
          this.$('input[name="active"]').prop('checked', true);
        }

      },

      // Method used to grab inputted changes and set them to the Random model on 
      // the click save event
      update: function(){
        var mover_name = this.$('#name').val();
        this.model.set('name', mover_name);

        var diffusion_coef = this.$('#diffusCoef').val();
        this.model.set('diffusion_coef', diffusion_coef);

        var uncertain_factor = this.$('#uncertFact').val();
        this.model.set('uncertain_factor', uncertain_factor);

        var active = this.$('#active').is(':checked');
        this.model.set('on', active);
      }
	});
    return randomForm;
});