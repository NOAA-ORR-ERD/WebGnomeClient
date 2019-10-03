define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'views/modal/base',
    'views/default/cesium'

], function($, _, Backbone, Cesium,
            BaseModal, CesiumView) {
    var pickCoordsView = BaseModal.extend({
        title: 'Click to select map coordinates',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',
        type: 'cesium',
        size: 'lg',
        target: null,
        crosshair: null,
        map: null,

        initialize: function(options){
            BaseModal.prototype.initialize.call(this, options);
            if(options && _.has(options, 'target')){
                this.target = options.target;
            }
            if(options && _.has(options, 'type')){
                this.type = options.type;
            }
            if(options && _.has(options, 'model')){
                this.model = options.model;
            }
        },

        render: function(options){
            BaseModal.prototype.render.call(this, options);
            var handler;
            if(this.type === 'cesium'){
                this.$('.modal-body').css('height', '600px');
                this.map = new CesiumView();
                this.$('.modal-body').append(this.map.$el);
                this.map.render();

                handler = new Cesium.ScreenSpaceEventHandler(this.map.viewer.scene.canvas);
                handler.setInputAction(_.bind(this.drop, this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
                handler.setInputAction(_.bind(this.lift, this), Cesium.ScreenSpaceEventType.LEFT_UP);

                if(this.model.get('obj_type').indexOf('mover') !== -1) {
                    this.renderGrid(this.map);
                }
            }
        },

        drop: function(e){
            this.pos = e.position;
        },

        lift: function(e){
            if(_.isEqual(e.position, this.pos)){
                this.setPosition();
            }
        },

        setPosition: function(){
            var mousePosition = this.pos;
            var viewer = this.map.viewer;

            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
            if (cartesian) {
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
                var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);

                this.target.val(lon + ', ' + lat + ',0');
                this.target.trigger('change');
                this.close();
            }
        },

        renderGrid: function(map){
            this.model.getGrid().then(_.bind(function(data){
                var primitive = new Cesium.PrimitiveCollection();
                map.viewer.scene.primitives.add(primitive);
                this.model.processLines(data, 3000, primitive);
                primitive.show = true;
                this.model.getBoundingRectangle().then(_.bind(function(rect) {
                    map.viewer.scene.camera.flyTo({
                        destination: rect,
                        duration: 0.25
                    });
                    var target_ar, point;
                    if (this.target.val() == '') {
                        point = Cesium.Rectangle.center(rect);
                        point = Cesium.Cartographic.toCartesian(point);
                    } else {
                        target_ar = this.target.val().split(',');
                        point = Cesium.Cartesian3.fromDegrees(parseFloat(target_ar[0]), parseFloat(target_ar[1]), 0);
                    }
                    this.crosshair = map.viewer.entities.add({
                        position: point,
                        billboard: {
                            image : '/img/crosshair.png',
                            width: 50,
                            height: 50
                        }
                    });
                }, this));
            }, this));
        },

        close: function(){
            this.trigger('hidden');
            BaseModal.prototype.close.call(this);
        }
    });

    return pickCoordsView;
});