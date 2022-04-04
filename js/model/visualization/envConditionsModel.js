
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
        isSmall: function(){
            var bb = this.get('bounding_box');
            return !(Math.abs(bb[1] - bb[0]) > 10 || Math.abs(bb[2]-bb[0]) > 10);
        },

        produceBoundsPolygon: function(outputView){
            var pts = this.get('bounding_poly');
            var polyFlat = _.flatten(pts);
            outputView.entities.add({
                polygon:{
                    hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(polyFlat)),
                    arcType: Cesium.ArcType.RHUMB,
                    height: -3,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.VIOLET.withAlpha(0.7)
                    ),
                    outline: true

                }
            });
        },
    });
    return envConditionsModel;
});
