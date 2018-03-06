define([
    'backbone',
    'underscore',
    'jquery',
    'views/base',
    'cesium'
], function(Backbone, _, $, BaseView, Cesium){
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
            targetFrameRate: 24,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            skyAtmosphere: false,
            sceneMode: Cesium.SceneMode.SCENE2D,
            mapProjection: new Cesium.WebMercatorProjection(),
            clockViewModel: new Cesium.ClockViewModel(new Cesium.Clock({
               canAnimate: false,
               shouldAnimate: false
            })),
            contextOptions: {
                webgl:{
                    preserveDrawingBuffer: false,
                },
            },
        },

        initialize: function(options){
            _.defaults(this.options, options);
            Cesium.BingMapsApi.defaultKey = 'Ai5E0iDKsjSUSXE9TvrdWXsQ3OJCVkh-qEck9iPsEt5Dao8Ug8nsQRBJ41RBlOXM';
        },

        render: function(){
            this.viewer = new Cesium.Viewer(this.el, this.options);
            BaseView.prototype.render.call(this);
        } 
    });

    return cesiumView;
});