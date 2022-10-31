define([
    'jquery',
    'underscore',
    'module',
    'views/base',
    'text!templates/panel/goodsrequestitem.html'
], function($, _, module, 
            BaseView, GoodsRequestItemTemplate) {
    var goodsRequestItem = BaseView.extend({
        events: function(){
            return _.defaults({
                'click .cancel-request': 'cancelGoodsRequest'
            }, BaseView.prototype.events);
        },
        
        initialize: function(options, model) {
            BaseView.prototype.initialize.call(this, options);
            this.model = model;
            this.attachListeners();
        },

        cancelGoodsRequest: function(currentTarget) {
            this.model.cancel();
        },

        render: function(){
            var compiled = _.template(GoodsRequestItemTemplate)({
                model: this.model
            });

            this.$el.html(compiled);
            this.$('.download-request').hide();
            this.$('.reconfirm-request').hide();
            this.$('.warning-request').hide();
            this.$('.pause-request').hide();
            if(this.model.get('state') === 'warning'){
                this.$('.warning-request').show();
            }
        },

        attachListeners: function(){
            this.listenTo(this.model, 'progress', this.update);
            this.listenTo(this.model, 'request-started', this.render);
        },

        update: function(pct) {
            this.$('.request-percentage').html(pct + '%');
            console.log(pct);
        }

    });
    return goodsRequestItem;
});