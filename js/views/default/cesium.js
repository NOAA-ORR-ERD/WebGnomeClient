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
            BaseView.prototype.render.call(this);
        }
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