define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'views/timeseries/start_stop',
    'text!templates/form/response/roc_burn.html'
], function($, _, Backbone, BaseResponseForm, TimeseriesView, ROCBurnTemplate){
    var ROCBurnForm = BaseResponseForm.extend({
        title: 'ROC Burn Response',
        size: 'lg',

        initialize: function(options){
            BaseResponseForm.prototype.initialize.call(this, options);
            // this.listenTo(this.model, 'change:burn', this.toggleBurn);
        },

        render: function(){
            var compiled = _.template(ROCBurnTemplate)(this.model.attributes);
            this.body = compiled;

            BaseResponseForm.prototype.render.call(this);
            this.timeseries = new TimeseriesView({model: this.model});
            this.$('.timeseries').append(this.timeseries.$el);

            // this.toggleBurn();
        },

        toggleBurn: function(){
            if(this.model.get('burn') === 'custom'){
                this.$('#burn_ef').attr('disabled', false);
            } else {
                this.$('#burn_ef').attr('disabled', true);
            }
        }
    });

    return ROCBurnForm;
});