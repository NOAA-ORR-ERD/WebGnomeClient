define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/random.html'
], function($, _, Backbone, FormModal, FormTemplate){
	var randomForm = FormModal.extend({
		initialize: function(options, modal){
           FormModal.prototype.initialize.call(this, options);

           this.body = _.template(FormTemplate, {
            
           });

        }
	});
	return randomForm;
});