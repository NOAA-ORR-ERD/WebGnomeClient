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
                'click .cancel-request': 'cancelGoodsRequest',
                'click .retry-request': 'retryGoodsRequest',
                'click .download-request': 'downloadGoodsRequest',
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

        downloadGoodsRequest: function(currentTarget){
            this.model.download();
        },

        retryGoodsRequest: function(currentTarget) {
            this.model.retry();
            this.$('.download-request').hide();
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
            if (this.model.get('state') === 'error' || this.model.error_status){
                var error_msg
                if (this.model.error_status){
                    error_msg = this.model.error_status[1];
                    if (this.model.get('state') === 'finished'){
                        this.$('.download-request').show();
                    }
                } else {
                    error_msg = _.bind(function(){
                        return this.model.get('message').trim();
                    },this);

                }
                this.$('.request-message').tooltip({
                    title: error_msg,
                    html:true,
                    trigger: 'hover',
                    show: true,
                    container: 'body'
                });
            }
            if(this.model.get('state') === 'warning'){
                this.$('.warning-request').show();
            }
            this.$('.cancel-request').tooltip({
                html:true,
                delay:{show:500, hide:100},
                container: 'body',
            });
            this.$('.retry-request').tooltip({
                delay:{show:500, hide:100},
                container: 'body',
            });
            this.$('.download-request').tooltip({
                html:true,
                delay:{show:500, hide:100},
                container: 'body',
            });
        },

        attachListeners: function(){
            //this.listenTo(this.model, 'change', this.update)
            this.listenTo(this.model, 'progress', this.update);
            this.listenTo(this.model, 'request-started', this.render);
            this.listenTo(this.model, 'rerender', this.render);
        },

        update: function(model) {
            
            var t_el = model.get('time_elapsed');
            this.$('.time_elapsed').html(t_el + '&#37');
            console.log(t_el);
        }

    });
    return goodsRequestItem;
});