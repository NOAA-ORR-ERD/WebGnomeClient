define([
    'underscore',
    'jquery',
    'backbone',
    'views/modal/form',
    'text!templates/form/windMover.html',
    'views/form/wind'
], function(_, $, Backbone, FormModal, FormTemplate, WindForm){
    'use strict';
	var windMoverForm = FormModal.extend({
		title: 'Wind Mover Settings',
		className: 'modal form-modal wind-form',
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
			var start_time = this.model.get('uncertain_time_delay');

			start_time = (start_time === '-inf') ? 0 : start_time;

			this.body = _.template(FormTemplate, {
				active_start: start_time,
				duration: this.model.get('uncertain_duration'),
				speed_scale: this.model.get('uncertain_speed_scale'),
				angle_scale: this.model.get('uncertain_angle_scale')
			});

			FormModal.prototype.render.call(this, options);

			if (this.model.get('on')) {
          		this.$('input[name="active"]').prop('checked', true);
        	} 
		},

		renderWindForm: function(options){
			WindForm.prototype.initialize.call(this, options);
		},

		update: function(){
			var start_time = this.$('#startTime').val();
			this.model.set('uncertain_time_delay', start_time);

			var uncert_duration = this.$('#duration').val();
        	this.model.set('uncertain_duration', uncert_duration);

	        var speed_scale = this.$('#speedScale').val();
	        this.model.set('uncertain_speed_scale', speed_scale);

	        var angle_scale = this.$('#angleScale').val();
	        this.model.set('uncertain_angle_scale', angle_scale);

	        var active = this.$('#active').is(':checked');
	        this.model.set('on', active);
            
		}

	});

	return windMoverForm;
});