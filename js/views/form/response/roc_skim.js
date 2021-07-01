define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/roc_skim.html',
    'views/timeseries/start_stop'
], function($, _, Backbone, BaseResponseForm, ROCSkimTemplate, TimeseriesView){
    var ROCSkimForm = BaseResponseForm.extend({
        title: 'ROC Skim Response',
        size: 'lg',

        initialize: function(options){
            BaseResponseForm.prototype.initialize.call(this, options);
            // this.listenTo(this.model, 'change:offload_to', this.toggleBargeTime);
            // this.listenTo(this.model, 'change:recovery', this.toggleRecovery);
        },

        render: function(){
            var compiled = _.template(ROCSkimTemplate)(this.model.attributes);
            this.body = compiled;
            BaseResponseForm.prototype.render.call(this);
            this.timeseries = new TimeseriesView({model: this.model});
            this.$('.timeseries').append(this.timeseries.$el);

            // this.$('#barge_arrival').datetimepicker({
            //     format: webgnome.config.date_format.datetimepicker,
            //     allowTimes: webgnome.config.date_format.half_hour_times,
            //     step: webgnome.config.date_format.time_step
            // });

            // this.toggleBargeTime();
            // this.toggleRecovery();
        },

        toggleBargeTime: function(){
            if(this.model.get('offload_to') === 'shore'){
                this.$('#barge_arrival').attr('disabled', true);
            } else {
                this.$('#barge_arrival').attr('disabled', false);
            }
        },

        toggleRecovery: function(){
            if(this.model.get('recovery') === 'custom'){
                this.$('#recovery_ef').attr('disabled', false);
            } else {
                this.$('#recovery_ef').attr('disabled', true);
            }
        },

        close: function(){
            this.timeseries.close();
            $('.xdsoft_datetimepicker:last').remove();
            BaseResponseForm.prototype.close.call(this);
        }
    });
    return ROCSkimForm;
});
