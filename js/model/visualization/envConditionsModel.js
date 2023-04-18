
define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
    'cesium',
    'model/base'
], function(_, $, Backbone, localforage, Cesium, BaseModel){
    'use strict';
    var envConditionsModel = BaseModel.extend({
        url: '/goods/list_models',
        model:{
        },

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
        },

        parse: function(response, options){
            return BaseModel.prototype.parse.call(this, response, options);
        },

        isSmall: function(){
            var bb = this.get('bounding_box');
            return !(Math.abs(bb[1] - bb[0]) > 10 || Math.abs(bb[2]-bb[0]) > 10);
        },

        getBoundingRectangle: function(promise) {
            if (webgnome.isUorN(promise)){
                promise = true;
            }
            var pts = this.get('bounding_poly');
            var polyFlat = _.flatten(pts);
            for (var i; i < polyFlat.length; i++){
                polyFlat[i] = Cesium.Math.clamp(polyFlat[i],-89.5, 89.5);
            }
            if (promise){
                return new Promise(_.bind(function(resolve, reject) {
                    resolve(Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(polyFlat)));
                }));
            } else {
                return Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(polyFlat));
            }
        },

        produceBoundsPolygon: function(outputView){
            var pts = this.get('bounding_poly');
            var polyFlat = _.flatten(pts);
            
            for (var i; i < polyFlat.length; i++){
                polyFlat[i] = Cesium.Math.clamp(polyFlat[i],-89.5, 89.5);
            }
            return outputView.entities.add({
                js_model: this,
                polygon:{
                    hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polyFlat)),
                    arcType: Cesium.ArcType.RHUMB,
                    height: -3,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.LIGHTGRAY.withAlpha(0.2)
                    ),
                    outline: true

                }
            });
        },
    });
    return envConditionsModel;
});
