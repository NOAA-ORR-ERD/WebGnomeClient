define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/form/windMover.html',
    'views/form/wind'
], function(_, $, Backbone, FormModal, FormTemplate, WindForm){
	var windMoverForm = FormModal.extend({
		title: 'Wind Mover Settings',
		className: 'modal fade form-modal wind-form',
		events: function(){
			return _.defaults({
				'click .windObj': 'renderWindForm'
			}, FormModal.prototype.events);
		},

		initialize: function(options, GnomeWind){
			FormModal.prototype.initialize.call(this, options);
			this.model = GnomeWind;
		},

		render: function(options){
			this.body = _.template(FormTemplate, {

			});

			FormModal.prototype.render.call(this, options);
		},

		renderWindForm: function(){
			var windForm = new WindForm();
			windForm.render();
		}

	});

	return windMoverForm;
});