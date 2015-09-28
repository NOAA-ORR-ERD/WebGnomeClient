define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/risk/shorelineSelect.html'
], function($, _, Backbone, FormModal, SelectTemplate){
	'use strict';
	var selectShorelineForm = FormModal.extend({
		title: 'Select Shoreline Type for Risk Assessment',
		className: 'modal fade form-modal shorelinetype-form',

		events: function(){
			return _.defaults({
				'click .straight': 'straight',
				'click .semi-circle': 'semiCircle'
			}, FormModal.prototype.events);
		},

		initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(SelectTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        straight: function(e){
            this.trigger('save');
        },

        semiCircle: function(){
            this.trigger('save');
        }

	});
	return selectShorelineForm;
});