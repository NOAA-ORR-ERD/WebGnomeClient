define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/water.html',
    'jqueryDatetimepicker',
    'compassui'
], function($, _, Backbone, FormModal, WaterTemplate){
    var waterForm = FormModal.extend({
    	className: 'modal fade form-modal model-form',
    	title: 'Water',
    	size: 'lg',

    	initialize: function(options, model){
    		FormModal.prototype.initialize.call(this, options);
    		this.model = model;
    	},

    	render: function(options){
    		this.body = _.template(WaterTemplate, {});

    		FormModal.prototype.render.call(this, options);

    	},

    	update: function(){

    	}

    });

    return waterForm;
});