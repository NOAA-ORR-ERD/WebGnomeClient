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
        buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="save">Save</button>',

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
            var wizard = _.isUndefined(options['wizard']) ? false : true
            this.model.set('wizard', wizard);
        },

        render: function(options){

            var output = (webgnome.model.get('outputters')
                          .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));
            
            var tz_offset = webgnome.model.get('timezone_offset'); 
            var enable_backwards = true;
            
            if (this.model.get('mode') === 'adios' || this.model.get('wizard')) {
                enable_backwards = false;
            }
            
            this.body = _.template(FormTemplate)({
                start_time: moment(this.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: this.model.formatDuration(),
                uncertain: this.model.get('uncertain'),
                include_uncertain_bounds: output.get('include_uncertain_bounds'),
                run_backwards: this.model.get('run_backwards'),
                time_step: Math.abs(this.model.get('time_step')),
                name: this.model.get('name'),
                enable_backwards: enable_backwards,
                tz_select: this.genTimeZoneSelect(),                
            });

            FormModal.prototype.render.call(this, options);

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  "1970/01/01",
                yearStart: "1970",
            });
            
            this.$('#datepick').on('click', _.bind(function() {
                this.$('#start_time').datetimepicker('show');
            }, this));

        },

        updateTimeTips: function(e) {
            var days = parseInt(this.$('#days').val(), 10);
            var hours = parseInt(this.$('#hours').val(), 10);
            var time_step = this.$('#time_step').val() * 60;
            if (days < 0) {
                days = 0;
                this.$('#days').val(0);
            }
            if (hours < 0) {
                hours = 0;
                this.$('#hours').val(0);
            }
            if (days === 0 & hours === 0) {
                hours = 1;
                this.$('#hours').val(1);
            }
            var duration = (((days * 24) + hours) * 60) * 60;
            //this.$('#minutes_label').text((Number(time_step/60).toFixed(2)) + " minutes" );
            this.$('#steps_label').text( duration/time_step +" steps");
        },

        update: function(e) {
            var thisName = this.$(e.currentTarget).attr('name');
            var thisValue = this.$(e.currentTarget).val();

            if (thisName === 'include_uncertain_bounds') {
                thisValue = e.currentTarget.checked;
                var output = (webgnome.model.get('outputters')
                              .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));
                output.set('include_uncertain_bounds', thisValue);
            }

            var start_time = moment(this.$('#start_time').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            
            this.model.set('start_time', start_time);

            var days = parseInt(this.$('#days').val(), 10);
            var hours = parseInt(this.$('#hours').val(), 10);
            if (days < 0) {
                days = 0;
                this.$('#days').val(0);
            }
            if (hours < 0) {
                hours = 0;
                this.$('#hours').val(0);
            }
            if (days === 0 && hours === 0) {
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
            
            var timeoffset = this.$('#timeoffset');
            
            var tz_offset = webgnome.model.get('timezone_offset');
            if (!_.isNull(timeoffset)){               
                tz_offset.set('offset', parseFloat(timeoffset.val()));
                tz_offset.set('title', this.$('#timeoffset option:selected').text());
            } else {
                tz_offset.set('offset', null);
                tz_offset.set('title', 'No Timezone Specified');
            }
            webgnome.model.set('timezone_offset', tz_offset);
            
            this.$('#time_step').val(time_step/60);
            this.updateTimeTips();

            var name = this.$('#name').val();
            this.model.set('name', name);

            var uncertain = this.$('#uncertain:checked').val();
            this.model.set('uncertain', _.isUndefined(uncertain) ? false : true);

            var run_backwards = this.$('#run_backwards:checked').val();
            this.model.set('run_backwards', _.isUndefined(run_backwards) ? false : true);
            if (run_backwards) {
                time_step = -time_step;
                duration = -duration;
            }

            // var time_steps = this.$('#time_steps').val();
            // var time_steps_mins = parseFloat(time_steps, 10) * 60;
            // this.model.set('time_step', time_steps_mins);
        },

        close: function(){
            this.$('#start_time').datetimepicker('destroy');
            FormModal.prototype.close.call(this);
        },

        back: function(){
            this.$('#start_time').datetimepicker('destroy');
            FormModal.prototype.back.call(this);
        }
    });

    return modelForm;
});

