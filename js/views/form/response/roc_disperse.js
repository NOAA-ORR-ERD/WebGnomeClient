define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'views/timeseries/start_stop',
    'views/form/platform',
    'text!templates/form/response/roc_disperse.html',

], function($, _, Backbone, BaseResponseForm, TimeseriesView, PlatformView,
    ROCDisperseTemplate){
    var ROCDisperseModel = BaseResponseForm.extend({
        title: 'ROC Disperse Response',
        size: 'lg',

        initialize: function(options){
            BaseResponseForm.prototype.initialize.call(this, options);
            this.listenTo(this.model, 'change:dosage', this.toggleDosage);  
            this.listenTo(this.model, 'change:dispersant', this.toggleDispersant);
        },

        render: function(){
            var compiled = _.template(ROCDisperseTemplate)(this.model.attributes);
            this.body = compiled;
            BaseResponseForm.prototype.render.call(this);

            this.timeseries = new TimeseriesView({model: this.model});
            this.$('.timeseries').append(this.timeseries.$el);

            this.platform = new PlatformView({model: this.model.get('platform')});
            this.$('.platform').append(this.platform.$el);

            this.toggleDosage();
            this.toggleDispersant();
        },

        toggleDosage: function(){
            if(this.model.get('dosage') === 'auto'){
                this.$('input[name="dosage"]').attr('disabled', true);
            } else {
                this.$('input[name="dosage"]').attr('disabled', false);
            }
        },

        toggleDispersant: function(){
            if(this.model.get('dispersant') === 'custom'){
                this.$('input[name="disp_eff"]').attr('disabled', false);
            } else {
                this.$('input[name="disp_eff"]').attr('disabled', true);
            }
        },

        close: function(){
            this.timeseries.close();
            this.platform.close();
            BaseResponseForm.prototype.close.call(this);
        }
    });
    return ROCDisperseModel;
});
