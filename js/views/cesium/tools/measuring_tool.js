define([
    'jquery',
    'underscore',
    'cesium',
    'views/cesium/tools/base_map_tool'
], function ($, _, Cesium, BaseMapTool) {
    "use strict";
    var MeasuringTool = function(cesiumView) {
        BaseMapTool.call(this, cesiumView);
        this.toolName = 'measuringTool';
        this.activePoints = [];
        this.activePointEntities = [];
        this.activeLabelEntities = [];
    };

    MeasuringTool.genToolTip = function(elem) {
        return {
            "title": 'Measure',
            "html": true,
            "container": elem,
            "placement": "right",
            "trigger": "hover click"
        };
    };

    MeasuringTool.prototype.activate = function() {
        BaseMapTool.prototype.activate.call(this);
        this.canvasElement.css('cursor', 'crosshair');
    };

    MeasuringTool.prototype.deactivate = function() {
        BaseMapTool.prototype.deactivate.call(this);
        this.canvasElement.prop('style').removeProperty('cursor');
        this.endMeasure();
    };

    MeasuringTool.prototype.setupMouseHandler = function() {
        this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.canvasElement[0]);
        this.mouseHandler.setInputAction(_.bind(this.measure, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.mouseHandler.setInputAction(_.bind(this.mouseMove, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.mouseHandler.setInputAction(_.bind(this.endMeasure, this), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };

    MeasuringTool.prototype.createPoint = function(worldPosition) {
        var point = this.viewer.entities.add({
          position: worldPosition,
          point: {
            color: Cesium.Color.BLACK,
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        });
        this.activePointEntities.push(point);
        this.cesiumView.trigger('requestRender');
        return point;
    };

    MeasuringTool.prototype.drawLine = function(positions) {
        var shape;
        shape = this.viewer.entities.add({
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 3,
                material: Cesium.Color.BLACK.withAlpha(0.7)
            },
        });
        return shape;
    };

    MeasuringTool.prototype.generateLabel = function() {
        var newLabel;
        var idx = this.activePoints.length - 2;
        var eidx = this.activePoints.length - 1;
        newLabel = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(
                _.bind(function() {
                    return Cesium.Cartesian3.midpoint(this.activePoints[idx], this.activePoints[eidx], new Cesium.Cartesian3());
                }, this),
                false
            ),
            label: {
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                text: new Cesium.CallbackProperty(
                    _.bind(function() {
                        var sp = Cesium.Cartographic.fromCartesian(this.activePoints[idx]);
                        var ep = Cesium.Cartographic.fromCartesian(this.activePoints[eidx]);
                        var geodesic = new Cesium.EllipsoidGeodesic();
                        geodesic.setEndPoints(sp,ep);
                        var lengthInMeters = Math.round(geodesic.surfaceDistance);
                        return (lengthInMeters / 1000).toFixed(2) + " km";
                    }, this),
                    false
                )
            }
        });
        this.activeLabelEntities.push(newLabel);
        return newLabel;
    };

    MeasuringTool.prototype.measure = function(movement) {
        //produces a new Line entity, one end attached to the clicked point, the other to the mouse cursor
        // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
        // we get the correct point when mousing over terrain.
        var earthPosition = this.viewer.scene.camera.pickEllipsoid(movement.position);
        // `earthPosition` will be undefined if our mouse is not over the globe.
        if (Cesium.defined(earthPosition)) {
            if (this.activePoints.length === 0) {// first point
                //if this.floatingPoint is defined, then we are currently drawing a line;
                this.floatingPoint = this.createPoint(earthPosition); //adds point to map
                this.activePoints.push(earthPosition);
                var dynamicPositions = new Cesium.CallbackProperty(
                    _.bind(function () {
                        return this.activePoints;
                    }, this
                ), false);

                this.heldEnt = this.drawLine(dynamicPositions); //adds line to map
            }
            this.activePoints.push(earthPosition);
            this.createPoint(earthPosition);
            this.generateLabel();
        }
    };

    MeasuringTool.prototype.mouseMove = function(movement) {
        if (Cesium.defined(this.floatingPoint)){
            var newPosition = this.viewer.scene.camera.pickEllipsoid(movement.endPosition);
            if (Cesium.defined(newPosition)) {
                this.floatingPoint.position.setValue(newPosition);
                this.activePoints.pop();
                this.activePoints.push(newPosition);
            }
        }
    };

    MeasuringTool.prototype.endMeasure = function(movement) {
        this.activePoints.pop();
        this.viewer.entities.remove(this.floatingPoint);
        this.viewer.entities.remove(this.heldEnt);
        for (var i = 0; i < this.activePointEntities.length; i++) {
            this.viewer.entities.remove(this.activePointEntities[i]);
        }
        for (i = 0; i < this.activeLabelEntities.length; i++) {
            this.viewer.entities.remove(this.activeLabelEntities[i]);
        }
        this.floatingPoint = undefined;
        this.heldEnt = undefined;
        this.activePoints = [];
        this.activeLabelEntities = [];
    };

    return MeasuringTool;
});