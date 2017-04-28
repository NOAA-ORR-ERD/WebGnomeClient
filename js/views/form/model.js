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
                time_steps: this.model.get('time_step') / 60,
                name: this.model.get('name')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
        },

        update: function() {
            var start_time = moment(this.$('#start_time').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            this.model.set('start_time', start_time);

            var days = this.$('#days').val();
            var hours = this.$('#hours').val();
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            this.model.set('duration', duration);

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

    