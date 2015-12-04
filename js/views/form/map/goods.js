define([
    'views/modal/form',
    'ol',
    'views/default/map',
    'text!templates/form/map/goods.html',
    'model/resources/shorelines'
], function(FormModal, ol, MapView, GoodsTemplate, ShorelineResource){
    var goodsMapForm = FormModal.extend({
        title: 'GOODS Map Generator',
        className: 'modal form-modal goods-map',

        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
            this.goods = new ShorelineResource();
            this.layers = {
                'NOS': new ol.layer.Vector({
                    source: new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: '/resource/nws_coast.json',
                    }),
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 2,
                            color: '#428bca'
                        })
                    })
                }),
                'GSHHS': new ol.layer.Vector({
                    source: new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: '/resource/world.json',
                    }),
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 2,
                            color: '#428bca'
                        })
                    })
                }),
            };
        },

        render: function(){
            this.body = _.template(GoodsTemplate);
            FormModal.prototype.render.call(this);
            this.map = new MapView({id: 'shoreline-goods-map'});
        },

        ready: function(){
            FormModal.prototype.ready.call(this);
            this.map.render();
        }
    });

    return goodsMapForm;
});