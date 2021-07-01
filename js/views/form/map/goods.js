define([
    'underscore',
    'views/modal/form',
    'text!templates/form/map/goods.html',
    'model/resources/shorelines'
], function(_, FormModal, GoodsTemplate, ShorelineResource){
    var goodsMapForm = FormModal.extend({
        title: 'GOODS Map Generator',
        className: 'modal form-modal goods-map',

        initialize: function(options){
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            this.goods = new ShorelineResource();
        },

        render: function(){
            this.body = _.template(GoodsTemplate)();
            FormModal.prototype.render.call(this);
        },

        ready: function(){
            FormModal.prototype.ready.call(this);
            this.map.render();
        }
    });

    return goodsMapForm;
});