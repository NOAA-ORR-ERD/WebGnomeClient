define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'model/movers/random',
    'views/modal/form',
    'text!templates/form/diffusion.html'
], function($, _, Backbone, module, moment, DiffusionModel, FormModal, DiffusionTemplate){
	'use strict';
	var diffusionForm = FormModal.extend({
        title: 'Horizontal Diffusion',

		events: function() {
            return _.defaults({
                'change select': function(e) {
                    this.showActiveRange(e);
                },                
            }, FormModal.prototype.events);
        },

        initialize: function(options, diffusionModel) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(diffusionModel)){
                this.model = diffusionModel;
            } else {
                this.model = new DiffusionModel();
            }
            
            if (!this.model.get('name')) {
                var count = webgnome.model.get('movers').where({obj_type: this.model.get('obj_type')});
                count = !count ? 1 : count.length + 1;
                this.model.set('name', 'Diffusion #' + count);
            }
        },

        render: function(options) {
            
            var active_range = this.model.get('active_range');
            
            this.body = _.template(DiffusionTemplate)({
                name: this.model.get('name'),
                coeff: this.model.get('diffusion_coef').toExponential(2),
                uncertain: this.model.get('uncertain_factor'),
                active_start: active_range[0],
                active_stop: active_range[1],
            });
            FormModal.prototype.render.call(this, options);
            
            this.$('#active_start, #active_stop').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
            
            if (JSON.stringify(active_range) === JSON.stringify(["-inf","inf"])) {
                this.$('#set_active_range').val("infinite");              
            } else {
                this.$('#set_active_range').val("data_range");
                this.$(".active_range").removeClass("hide");
            }
        },

        update: function() {
            var name = this.$('#name').val();
            var coeff = parseFloat(this.$('#coeff').val());
            var uncertain_factor = parseFloat(this.$('#uncertain').val());
            var active_start = this.$('#active_start').val();
            var active_stop = this.$('#active_stop').val() ;
            
            if (active_start !== '-inf') {
                active_start = moment(active_start, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            }
            if (active_stop !== 'inf') {
                active_stop = moment(active_stop, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            }
            
            this.model.set('active_range', [active_start, active_stop]);

            this.model.set('name', name);
            this.model.set('diffusion_coef', coeff);
            this.model.set('uncertain_factor', uncertain_factor);
        },

    
        showActiveRange: function(e) {
            
            var value = e.currentTarget.value;
            
            if (value === 'data_range') {
                this.$(e.currentTarget).parent().siblings('.hide').removeClass('hide');
                this.model.set('active_range',[this.model.get('data_start'),this.model.get('data_stop')]);
            } else {
                this.$(e.currentTarget).parent().siblings('.active_range').addClass('hide');
                this.model.set('active_range',["-inf","inf"]);
            }
            
            this.$('#active_start').val(this.model.get('active_range')[0]);
            this.$('#active_stop').val(this.model.get('active_range')[1]);
    },
        
    });

	
	return diffusionForm;
});