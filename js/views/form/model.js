define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/modal/form',
    'text!templates/form/model.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, FormModal, FormTemplate){
    'use strict';
    var modelForm = FormModal.extend({
        className: 'modal form-modal model-form',
        title: 'Model Settings',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({
                'change #days': 'updateTimeTips',
                'change #hours': 'updateTimeTips',
                'change #time_step': 'updateTimeTips'
            }, FormModal.prototype.events);
        },
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        render: function(options){
            
            
            this.body = _.template(FormTemplate, {
                start_time: moment(this.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: this.model.formatDuration(),
                uncertain: this.model.get('uncertain'),
                time_step: this.model.get('time_step'),
                name: this.model.get('name'),
                mode: this.model.get('mode')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  "1970/01/01",
                yearStart: "1970",
            });
            
        },

        updateTimeTips: function(e) {
            var days = parseInt(this.$('#days').val(), 10);
            var hours = parseInt(this.$('#hours').val(), 10);
            var time_step = this.$('#time_step').val() * 60;
            if (days < 0) {
                days = 0;
                this.$('#days').val(0);
            }
            if (days === 0 & hours === 0) {
                hours = 1;
                this.$('#hours').val(1);
            }
            var duration = (((days * 24) + hours) * 60) * 60;
            //this.$('#minutes_label').text((Number(time_step/60).toFixed(2)) + " minutes" );
            this.$('#steps_label').text( duration/time_step +" steps");
        },

        update: function() {
            var start_time = moment(this.$('#start_time').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            this.model.set('start_time', start_time);

            var days = parseInt(this.$('#days').val(), 10);
            var hours = parseInt(this.$('#hours').val(), 10);
            if (days < 0) {
                days = 0;
                this.$('#days').val(0);
            }
            if (days === 0 & hours === 0) {
                hours = 1;
                this.$('#hours').val(1);
            }
            var duration = (((days * 24) + hours) * 60) * 60;
            this.model.set('duration', duration);

            var time_step = this.$('#time_step').val() * 60;
            time_step = parseInt(Math.min(Math.max(time_step, 1), duration),10);
            
            if (time_step <= 3600) {
                while (parseInt(3600/time_step,10) !== 3600/time_step) {
                    time_step = time_step - 1;
                }
            } else {
                while (parseInt(time_step/3600,10) !== time_step/3600) {
                    time_step = time_step - 1;
                }
                
            }
            
            webgnome.model.set('time_step', time_step);
            this.$('#time_step').val(time_step/60);
            this.updateTimeTips();

            var name = this.$('#name').val();
            this.model.set('name', name);

            var uncertain = this.$('#uncertain:checked').val();
            this.model.set('uncertain', _.isUndefined(uncertain) ? false : true);

            // var time_steps = this.$('#time_steps').val();
            // var time_steps_mins = parseFloat(time_steps, 10) * 60;
            // this.model.set('time_step', time_steps_mins);
        },

        save: function(){
            FormModal.prototype.save.call(this, function(){
                $('.xdsoft_datetimepicker').remove();
            });
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.close.call(this);
        },

        back: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.back.call(this);
        }
    });
    
    return modelForm;
});

    