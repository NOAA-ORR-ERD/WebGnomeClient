
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
            //test for a 'small' model (versus a 'regional' model)
            var bb = this.get('bounding_box');
            return !(Math.abs(bb[2] - bb[0]) > 10 || Math.abs(bb[3]-bb[1]) > 10);
        },
        
        isGlobal: function() {
            //test for a 'global' model (versus a 'regional' model)
            var bb = this.get('bounding_box');
            return Math.abs(bb[2] - bb[0]) > 90 || Math.abs(bb[3]-bb[1]) > 60;
        },

        getCesiumStartBox: function(promise) {
            //function to provide a normalized and 'clamped' bounding box that looks good in Cesium
            //The function is similar to the getBoundingRectangle below but does NOT provide the 'real'
            //bounding box. It provides one that looks good in Cesium.
            if (webgnome.isUorN(promise)){
                promise = true;
            }
            var retRect;
            var bb = _.clone(this.get('bounding_box'));
            if (this.isGlobal()){
                retRect = Cesium.Rectangle.fromDegrees(-180, -50, 100, 80);
                if (promise){
                    return new Promise(_.bind(function(resolve, reject) {
                        resolve(retRect);
                    }));
                } else {
                    return retRect;
                }
            } else {
                return this.getBoundingRectangle(promise);
            }
            
        },

        getBoundingRectangle: function(promise) {
            if (webgnome.isUorN(promise)){
                promise = true;
            }
            var retRect;
            var pts = this.get('bounding_poly');
            var polyFlat = _.flatten(pts);
            for (var i; i < polyFlat.length; i++){
                polyFlat[i] = Cesium.Math.clamp(polyFlat[i],-89.5, 89.5);
            }
            retRect = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(polyFlat));
            if (promise){
                return new Promise(_.bind(function(resolve, reject) {
                    resolve(retRect);
                }));
            } else {
                return retRect;
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
