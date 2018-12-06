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
        options: {
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
        },

        initialize: function(options){
            _.defaults(this.options, options);
            Cesium.BingMapsApi.defaultKey = 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM';
            this.viewer = new Cesium.Viewer(this.el, this.options);
            this.viewer.scene.globe.enableLighting = false;
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
            BaseView.prototype.render.call(this);
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