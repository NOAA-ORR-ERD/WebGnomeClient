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

        render: function(){
            var compiled = _.template(ROCSkimTemplate, this.model.attributes);
            this.body = compiled;
            BaseResponseForm.prototype.render.call(this);
            this.timeseries = new TimeseriesView({model: this.model});
            this.$('.timeseries').append(this.timeseries.$el);
        },

        close: function(){
            this.timeseries.close();
            BaseResponseForm.prototype.close.call(this);
        }
    });
    return ROCSkimForm;
});