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
                'click .reconfirm-request': 'reconfirmGoodsRequest',
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

        reconfirmGoodsRequest: function(currentTarget) {
            this.model.reconfirm();
        },

        render: function(){
            var compiled = _.template(GoodsRequestItemTemplate)({
                model: this.model,
                show_timing: webgnome.config.show_goods_timing,
            });

            this.$el.html(compiled);
            this.$('.download-request').hide();
            this.$('.reconfirm-request').hide();
            this.$('.warning-request').hide();
            this.$('.pause-request').hide();
            var msg, error_type;
            if (this.model.error_type){
                error_type = this.model.error_type.replace(/_/g, ' ').toUpperCase();
                if (this.model.get('state') === 'finished'){
                    // if the request finished with an error, allow the user to download the file and see the error message
                    this.$('.download-request').show();
                }
            }
            msg = _.bind(function(){
                return this.model.get('message').trim();
            },this);
            if (msg() !== 'None' && msg() !== ''){
                this.$('.request-message').tooltip({
                    title: msg,
                    html:true,
                    trigger: 'hover',
                    show: true,
                    container: 'body'
                });
            }

            if(this.model.get('state') === 'reconfirm'){
                this.$('.reconfirm-request').show();
            }
            this.$('.reconfirm-request').tooltip({
                html:true,
                delay:{show:500, hide:100},
                container: 'body',
            });
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