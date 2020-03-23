define([
    'backbone',
    'underscore',
    'jquery',
    'cesium',
    'views/base'
], function(Backbone, _, $, Cesium, BaseView){
    var cesiumView = BaseView.extend({
        className: 'cesium-map',
        id: 'cesium-map',
        options: function() {
            return {
                animation: false,
                baseLayerPicker: false,
                vrButton: false,
                geocoder: false,
                fullscreenButton: false,
                homeButton: false,
                timeline: false,
                sceneModePicker: false,
                infoBox: false,
                selectionIndicator : false,
                targetFrameRate: 30,
                navigationHelpButton: false,
                navigationInstructionsInitiallyVisible: false,
                skyAtmosphere: false,
                sceneMode: Cesium.SceneMode.SCENE2D,
                mapProjection: new Cesium.WebMercatorProjection(),
                clockViewModel: new Cesium.ClockViewModel(new Cesium.Clock({
                   canAnimate: false,
                   shouldAnimate: false
                })),
                imageryProvider : Cesium.createOpenStreetMapImageryProvider({
                    url : 'https://a.tile.openstreetmap.org/'
                }),
                contextOptions: {
                    webgl:{
                        preserveDrawingBuffer: false,
                    },
                },
                requestRenderMode: true
            };
        },

        initialize: function(options){
            if (_.isUndefined(options)) {
                options = {};
            }
            BaseView.prototype.initialize.call(this, options);
            _.defaults(options, this.options());
            this.options = options;
            Cesium.BingMapsApi.defaultKey = 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM';
            this.viewer = new Cesium.Viewer(this.el, options);
            this.viewer.resolutionScale = window.devicePixelRatio;
            this.viewer.scene.postProcessStages.fxaa.enabled = false;
            this.viewer.scene.highDynamicRange = false;
            this.viewer.scene.globe.enableLighting = false;
            this.viewer.entities.withLabelOpen = [];
            this.listenTo(this, 'requestRender', _.bind(function() {this.viewer.scene.requestRender();}, this));

            this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.heldEnt = null;
        },

        render: function(){
            /*
            if (this.is_static) {
                this.viewer.scene.screenSpaceCameraController.enableRotate = false;
                this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
                this.viewer.scene.screenSpaceCameraController.enableZoom = false;
                this.viewer.scene.screenSpaceCameraController.enableTilt = false;
                this.viewer.scene.screenSpaceCameraController.enableLook = false;
            }
            */
            //disable default focus on entity
            this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            this.resetEntPickup(null); //attaches correct mouse handlers
            BaseView.prototype.render.call(this);
        },

        requestRender: function() {
            this.viewer.scene.requestRender();
        },

        resetCamera: function(model) {
            //timeout so transition to/from fullscreen can complete before recentering camera
            setTimeout(_.bind(function(){this._focusOn(model);}, this), 100);
        },

        _focusOn: function(obj) {
            if (_.isUndefined(obj)){
                return;
            } else if (obj.getBoundingRectangle) {
                obj.getBoundingRectangle().then(_.bind(function(rect) {
                    this.viewer.scene.camera.flyTo({
                        destination: rect,
                        duration: 0
                    });
                    this.viewer.scene.requestRender();
                }, this));
            } else {
                this.viewer.scene.camera.flyTo({
                        destination: obj,
                        duration: 0
                    });
                this.viewer.scene.requestRender();
            }
        },

        pickupEnt: function(movement, ent) {
            //picks the canvas, and if a pin is hit, attaches it to the mouse cursor
            //also adds handler to place the pin down again
            //this context should always be the Form object
            if (_.isUndefined(ent)) {
                var pickedObjects = this.viewer.scene.drillPick(movement.position);
                if (pickedObjects){
                    var pickedObj = _.find(pickedObjects, function(po){return po.id && po.id.movable;}, this);
                    if (pickedObj) {
                        ent = pickedObj.id;
                    }
                }
            }
            if (ent && ent.movable) {
                ent.show = true;
                if (ent.label) {
                    ent.label.show = true;
                }
                ent.prevPosition = Cesium.Cartesian3.clone(ent.position.getValue(Cesium.Iso8601.MINIMUM_VALUE));
                this.heldEnt = ent;
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.moveEnt, ent), _, this.viewer.scene), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.dropEnt, ent), _, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.cancelEnt, this), _, ent), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                this.$('.cesium-viewer').css('cursor', 'grabbing');
                this.trigger('pickupEnt', ent);
            }
            this.viewer.scene.requestRender();
            return ent;
        },

        hoverEnt: function(movement) {
            //this context should always be the Form object
            var pickedObjects = this.viewer.scene.drillPick(movement.endPosition);
            var pickedObj, ent;
            if (pickedObjects.length > 0){
                pickedObj = _.find(pickedObjects, function(po){return po.id && (po.id.movable || po.id.hoverable);}, this);
                this.trigger('hover', pickedObj);
                if (pickedObj) {
                    ent = pickedObj.id;
                    if (ent.movable) {
                        this.$('.cesium-viewer').css('cursor', 'grab');
                    } else if (ent.hoverable) {
                        this.$('.cesium-viewer').css('cursor', 'help');
                    }
                    if (ent.label) {
                        this.viewer.entities.withLabelOpen.push(ent);
                        ent.label.show = true;
                    }
                    
                }
            }

            if (ent) {
                var toBeClosed = _.difference(this.viewer.entities.withLabelOpen, [ent]);
                if (toBeClosed.length > 0) {
                    _.each(toBeClosed, function(ent) {ent.label.show = false;});
                    this.viewer.entities.withLabelOpen = [ent];
                }
            } else {
                var cssObject = this.$('.cesium-viewer').prop('style');
                cssObject.removeProperty('cursor');
                //this.$('.cesium-viewer').css('cursor', 'default');
                _.each(this.viewer.entities.withLabelOpen, function(ent) {ent.label.show = false;});
                this.viewer.entities.withLabelOpen = [];
            }
            this.viewer.scene.requestRender();
        },

        moveEnt: function(movement, scene) {
            //this context should always be an entity
            var newPos = scene.camera.pickEllipsoid(movement.endPosition);
            //this.position = newPos;
            this.position.setValue(newPos);
            scene.requestRender();
        },

        dropEnt: function(movement, view) {
            //this context should always be an entity
            var newPos = view.viewer.scene.camera.pickEllipsoid(movement.position);
            //this.position = newPos;
            this.position.setValue(newPos);
            var coords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(newPos);
            coords = [Cesium.Math.toDegrees(coords.longitude), Cesium.Math.toDegrees(coords.latitude), 0]; //not coords.height (may not be correct)
            view.trigger('droppedEnt', this, coords);
            this.label.show = false;
            view.viewer.scene.requestRender();
            view.resetEntPickup(this);
        },

        cancelEnt: function(movement, ent) {
            //this context should always be the Form object
            if (ent) {
                if (this.heldEnt !== ent) {
                    console.error('something went wrong');
                }
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                this.mouseHandler.setInputAction(_.bind(this.hoverEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.setInputAction(_.bind(this.pickupEnt, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
                ent.position.setValue(Cesium.Cartesian3.clone(ent.prevPosition));
                ent.label.show = false;
                this.viewer.scene.requestRender();
                this.trigger('cancelEnt', ent);
                this.resetEntPickup(ent);
            }
        },

        resetEntPickup: function(ent) {
            //this context should always be the Form object
            this.$('.cesium-viewer').css('cursor', 'grab');
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.mouseHandler.setInputAction(_.bind(this.hoverEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.setInputAction(_.bind(this.pickupEnt, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.heldEnt = null;
            this.viewer.scene.requestRender();
            this.trigger('resetEntPickup', ent);
        },

    });

    cesiumView.viewCache = {};

    //Because creating new Cesium Viewers is expensive, this function may be used to create them
    //and automatically cache/retrieve them for later use.
    cesiumView.getView = function(id, options, cache_opts) {
        if(_.isUndefined(cache_opts)) {
            cache_opts = {};
        }
        _.defaults(
            cache_opts,
            {'cache_save': true, //new view will be saved in the cache
             'cache_load': true, //attempt to load view id from cache before creating a new one
             'overwrite': false, //if not loading from cache, and cache_save is true, determines if an existing entry may be overwritten
             }
        );
        var v;
        if (cache_opts.cache_load) {
            v = cesiumView.viewCache[id];
            if (_.isUndefined(v)) {
                v = new cesiumView(options);
            }
        } else {
            v = new cesiumView(options);
        }

        if (cache_opts.cache_save) {
            if (!_.isUndefined(cesiumView.viewCache[id])) {
                if (cache_opts.overwrite) {
                    cesiumView.viewCache[id] = v;
                }
            } else {
                cesiumView.viewCache[id] = v;
            }
        }

        return v;
    };
    return cesiumView;
});