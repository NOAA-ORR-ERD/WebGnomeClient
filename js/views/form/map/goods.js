define([
    'underscore',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/map/goods.html',
    'model/resources/shorelines'
], function(_, FormModal, CesiumView, RectangleTool, GoodsTemplate, ShorelineResource){
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
            this.map = new CesiumView({toolboxOptions:{defaultToolType: RectangleTool}})
            this.$('#shoreline-goods-map').append(this.map.$el);
            this.map.render();
        },
    });

    return goodsMapForm;
});