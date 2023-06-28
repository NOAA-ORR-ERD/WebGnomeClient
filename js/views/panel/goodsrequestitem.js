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
            //this.listenTo(this.model, 'change', this.update)
            this.listenTo(this.model, 'progress', this.update);
            this.listenTo(this.model, 'request-started', this.render);
        },

        update: function(model) {
            
            var t_el = model.get('time_elapsed');
            this.$('.time_elapsed').html(t_el + '&#37');
            console.log(t_el);
        }

    });
    return goodsRequestItem;
});