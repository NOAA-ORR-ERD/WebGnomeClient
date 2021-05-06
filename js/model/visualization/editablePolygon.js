//An advanced Cesium Entity that represents a polygon.
//Also adds optional selectable vertex points

define([
    'underscore',
    'cesium',
    'model/visualization/spatial_release_appearance'
], function(_, Cesium, SpatialReleaseAppearance){
    'use strict';
    var poly = function(options) {
        //Cesium.CustomDataSource.apply(this, [options.name]);
        this._showVerts = options.showVerts || false;
        this._movableVerts = options.movableVerts || this._showVerts;
        this._index = options.index;
        this._vertices = [];
        this._colormap = options.colormap || new SpatialReleaseAppearance()

        for (var i = 0; i < options.positions.length; i++) {
            this._vertices.push(new Cesium.Entity({
                id: 'polygon_' + this._index + '_vertex_' + String(i),
                idx: i,
                movable: this.movableVerts,
                position: options.positions[i],
                point: {
                    show: new Cesium.CallbackProperty(function(){
                        return this._showVerts;
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
            poly = polyCbk;
        }
        this._thickness = options.thickness || 0;
    
        this.polygon = new Cesium.Entity({ //The polygon
            id : 'polygon_' + this._index,
            polygon: {
                hierarchy: poly,
                outline: true,
                height:0,
                material: new Cesium.ColorMaterialProperty(
                  Cesium.Color.DARKGRAY.withAlpha(this._colormap.numScale(this._thickness))
                ),
            }
        });
        this.entities = this._vertices.concat(this.polygon);
    };

    poly.prototype.hideVerts = function() {
        this._showVerts = false;
        this._vertices.map(function(v){v.show = false;});
    };

    poly.prototype.showVerts = function() {
        this._showVerts = true;
        this._vertices.map(function(v){v.show = true;});
    };
    
    return poly;
});