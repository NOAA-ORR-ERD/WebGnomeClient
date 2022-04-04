
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
            return !(Math.abs(bb[1] - bb[0]) > 10 || Math.abs(bb[2]-bb[0]) > 10)
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

        generateVis: function(addOpts) {
            if (this.isNew()) {
                return undefined;
            }
            return Promise.all([this.getPolygons(), this.getMetadata()])
            .then(_.bind(function(data){
                    var dataSourcePromise = this.processPolygons(data[0]);
                    dataSourcePromise.then(_.bind(function(ds){
                        // Add pin to datasource entities and add it to spillPins attribute
                        var coll = ds.entities;
                        var centroid = this.get('centroid');
                        ds.spillPins = []; //because base release uses an array for this attribute
    
                        var textPropFuncGen = function(newPin) {
                            return new Cesium.CallbackProperty(
                                _.bind(function(){
                                    var loc = Cesium.Ellipsoid.WGS84.cartesianToCartographic(this.position._value);
                                    var lon, lat;
                                    if (this.coordFormat === 'dms') {
                                        lon = Graticule.prototype.genDMSLabel('lon', loc.longitude);
                                        lat = Graticule.prototype.genDMSLabel('lat', loc.latitude);
                                    } else {
                                        lon = Graticule.prototype.genDegLabel('lon', loc.longitude);
                                        lat = Graticule.prototype.genDegLabel('lat', loc.latitude);
                                    }
                                    var ttstr;
                                    var sp = webgnome.model.get('spills').findParentOfRelease(this.gnomeModel);
                                    if (sp && sp.get('name')){
                                        ttstr = 'Name: ' + ('\t' + sp.get('name')) +
                                            '\nLon: ' + ('\t' + lon) +
                                            '\nLat: ' + ('\t' + lat);
                                    } else{
                                        ttstr = 'Lon: ' + ('\t' + lon) +
                                            '\nLat: ' + ('\t' + lat);
                                    }
                                    return ttstr;
                                }, newPin),
                                true
                            );
                        };
                        var newPin = coll.add(_.extend({
                            position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(centroid[0], centroid[1])),
                            billboard: {
                                image: '/img/spill-pin.png',
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                            },
                            show: true,
                            gnomeModel: this,
                            model_attr : 'centroid',
                            coordFormat: 'dms',
                            index: 0,
                            movable: false,
                            hoverable: true,
                            label : {
                                show : false,
                                showBackground : true,
                                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
                                font : '14px monospace',
                                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                                verticalOrigin : Cesium.VerticalOrigin.TOP,
                                pixelOffset : new Cesium.Cartesian2(2, 0),
                                eyeOffset : new Cesium.Cartesian3(0,0,-5),
                            }
                        }, addOpts));
                        newPin.label.text = textPropFuncGen(newPin);
                        coll.spillPins.push(newPin);
                        
                        return ds;

                    }, this));
                    
                    return dataSourcePromise;
                }, this)
            ).catch(console.log);
        },

    });
    return envConditionsModel;
});
