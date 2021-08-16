define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'text!templates/form/mover/edit.html',
    'views/modal/form'
], function($, _, Backbone, module, moment, FormTemplate, FormModal) {
    'use strict';
    var currentForm = FormModal.extend({
            
        className: 'modal form-modal model-form',
        title: 'Gridded Currents ',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        events: function() {
            return _.defaults({
                'change select': function(e) {
                    this.showActiveRange(e);
                },
                'click div :checkbox': 'setExtrapolation',
            }, FormModal.prototype.events);
        },

        render: function(options) {
            var extrapolation_allowed = false;
            var start_time;
            var end_time;
            var scale_value;
            //active range only valid for mover at this point
            var active_range = this.model.get('active_range');
            var current = this.model.get('current');
            if (current) {
                extrapolation_allowed = current.get('extrapolation_is_allowed');
                start_time = current.get('data_start');
                end_time = current.get('data_stop');
                scale_value = this.model.get('scale_value');
            }
            else {
                // The C++ based GridCurrentMover does not have a composed
                // GridCurrent object, so we need to make this exceptional
                // case.
                extrapolation_allowed = this.model.get('extrapolate');
                start_time = this.model.get('data_start');
                end_time = this.model.get('data_stop');
                scale_value = this.model.get('current_scale');
            }
              
            // to change active start: moment(this.model.get('start_time')).format(webgnome.config.date_format.moment),
            this.body = _.template(FormTemplate)({
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: scale_value,
                extrapolation_is_allowed: extrapolation_allowed,
                start_time: start_time,
                end_time: end_time,
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
            
            var name = this.$('#mover_name').val();
            this.model.set('name', name);
            
            var active_start = this.$('#active_start').val();
            var active_stop = this.$('#active_stop').val() ;  
            
            if (active_start !== '-inf') {
                active_start = moment(active_start, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            }
            if (active_stop !== 'inf') {
                active_stop = moment(active_stop, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            }
            
            this.model.set('active_range', [active_start, active_stop]);
            
            var scale_value = this.$('#scale_value').val();
            this.model.set('scale_value', scale_value);
            
        },
        
        
        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');

            var current = this.model.get('current');
            if (current) {
                current.set('extrapolation_is_allowed', selected);
            }
            else {
                // The C++ based GridCurrentMover does not have a composed
                // GridCurrent object, so we need to make this exceptional
                // case.
                this.model.set('extrapolate', selected);
            }

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

    return currentForm;
});