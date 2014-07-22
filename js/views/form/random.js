define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/random.html'
], function($, _, Backbone, FormModal, FormTemplate){
	var randomForm = FormModal.extend({
		className: 'modal fade form-modal random-form',
		title: 'Random Mover'
	});
});