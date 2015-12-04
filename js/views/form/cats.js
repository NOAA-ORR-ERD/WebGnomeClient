define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/cats.html'
], function($, _, Backbone, FormModal, FormTemplate){
    'use strict';
	var catsForm = FormModal.extend({
		title: 'Current Mover Settings',
		className: 'modal form-modal',

		initialize: function(options, GnomeTide){
			FormModal.prototype.initialize.call(this, options);
			this.model = GnomeTide;
		},

		// Render method takes data from the Cats mover model to then append them to 
		// the template
		render: function(options){
			this.body = _.template(FormTemplate, {
				currentFile: this.model.get('filename'),
				fileName: this.model.get('tide').attributes.name,
				fileUnits: "knots",                                 // These hard coded values
				unscaleRefPoint: "0.545547 m/s"                     // should be replaced
			});                                                     // when model is updated

			FormModal.prototype.render.call(this, options);

			if (this.model.get('on')) {
          		this.$('input[name="active"]').prop('checked', true);
        	} 
		},

		update: function(){
			var active = this.$('#active').is(':checked');
        	this.model.set('on', active);
        	
		}
	});

	return catsForm;
});