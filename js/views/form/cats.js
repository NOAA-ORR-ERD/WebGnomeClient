define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/cats.html'
], function($, _, Backbone, FormModal, FormTemplate){
	var catsForm = FormModal.extend({
		title: 'Cats Mover',
		className: 'modal fade form-modal',

		initialize: function(options, modal){
			FormModal.prototype.initialize.call(this, options);
		},

		render: function(options){
			this.body = _.template(FormTemplate);

			FormModal.prototype.render.call(this, options);
		}
	});

	return catsForm;
});