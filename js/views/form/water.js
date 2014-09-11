define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/water.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, WaterTemplate){
    var waterForm = FormModal.extend({
    	className: 'modal fade form-modal model-form',
    	title: 'Water',

    	events: function(){
    		return _.defaults({
    			'change select': 'revealManualInputs'
    		}, FormModal.prototype.events);
    	},

    	initialize: function(options, model){
    		FormModal.prototype.initialize.call(this, options);
    		this.model = model;
    	},

    	render: function(options){
    		this.body = _.template(WaterTemplate, {});

    		FormModal.prototype.render.call(this, options);

    		this.$('#sediment-entry').hide();
    		this.$('#salinity-entry').hide();

    	},

    	update: function(){

    	},

    	revealManualInputs: function(e){
    		var value = e.currentTarget.value;
    		var id = e.currentTarget.id;
    		if (value === 'other' && id !== this.selectedId){
    			this.$('#' + id + '-entry').show();
    		} else {
    			this.$('#' + id + '-entry').hide();
    		}
    		this.selectId = id;
    	}

    });

    return waterForm;
});