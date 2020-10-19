//An advanced Cesium Entity that represents a polygon.
//Also adds optional selectable vertex points

define([
    'underscore',
    'cesium'
], function(_, Cesium){
    'use strict';
    var poly = function(options) {
        Cesium.CustomDataSource.apply(this, [options.name]);
        this._showVerts = options.showVerts || false;
        this._movableVerts = options.movableVerts || this._showVerts;
        this._vertices = [];

        for (var i = 0; i < options.positions.length; i++) {
            this._vertices.push(this.entities.add({
                id: 'vertex_' + String(i),
                idx: i,
                movable: this.movableVerts,
                position: options.positions[i],
                point: {
                    show: new Cesium.CallbackProperty(function(){
                        return this._showVerts
                    }.bind(this), false),
                    pixelSize: 5,
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e6, 0.5),
                },
            }));
        }
        var poly = new Cesium.PolygonHierarchy(this._vertices.map(function(v){return v.position._value;}));
        var polyPosCbk = function() {
            return new Cesium.PolygonHierarchy(this._vertices.map(function(v){return v.position._value;}));
        };
        polyPosCbk = polyPosCbk.bind(this);
        var polyCbk = new Cesium.CallbackProperty(polyPosCbk, false);
        if (this._movableVerts){
            poly = polyCbk
        }
        this._weight = options.weight || 0;
    
        this.entities.add({ //The polygon
            polygon: {
                hierarchy: poly,
                outline: true,
                height:0,
                material: new Cesium.ColorMaterialProperty(
                  Cesium.Color.WHITE.withAlpha(this._weight)
                ),
            }
        });
    };
    poly.prototype = Cesium.CustomDataSource.prototype;
    poly.prototype.constructor = poly;

    poly.prototype.hideVerts = function() {
        this._showVerts = false;
        this._vertices.map(function(v){v.show = false;})
    }

    poly.prototype.showVerts = function() {
        this._showVerts = true;
        this._vertices.map(function(v){v.show = true;})
    }
    
    return poly;
});