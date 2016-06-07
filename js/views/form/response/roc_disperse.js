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
        },

        render: function(){
            var compiled = _.template(ROCDisperseTemplate, this.model.attributes);
            this.body = compiled;
            BaseResponseForm.prototype.render.call(this);

            this.timeseries = new TimeseriesView({model: this.model});
            this.$('.timeseries').append(this.timeseries.$el);

            this.platform = new PlatformView({model: this.model.get('platform')});
            this.$('.platform').append(this.platform.$el);
        },

        close: function(){
            this.timeseries.close();
            this.platform.close();
            BaseResponseForm.prototype.close.call(this);
        }
    });
    return ROCDisperseModel;
});