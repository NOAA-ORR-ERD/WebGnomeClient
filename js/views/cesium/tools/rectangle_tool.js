define([
    'jquery',
    'underscore',
    'cesium',
    'views/cesium/tools/base_map_tool'
], function ($, _, Cesium, BaseMapTool) {
    "use strict";
    var BoxDrawTool = function(cesiumView) {
        BaseMapTool.call(this, cesiumView);
        this.toolName = 'BoxDrawTool';
        this.activePoints = [];
        this.activePointEntities = [];
        this.activeLabelEntities = [];
    };

    BoxDrawTool.genToolTip = function(elem) {
        var opts = {
            "title": 'Draw Box',
            "html": true,
            "container": elem,
            "placement": "right",
            "trigger": "hover",
            "persist_box": false, //whether the box remains on map or is removed
        };
        if ($(elem).parent().hasClass('right-content-pane')) {
            opts.placement = 'left';
        }
        return opts;
    };

    BoxDrawTool.prototype.activate = function() {
        BaseMapTool.prototype.activate.call(this);
        this.canvasElement.css('cursor', 'crosshair');
    };

    BoxDrawTool.prototype.deactivate = function() {
        BaseMapTool.prototype.deactivate.call(this);
        this.canvasElement.prop('style').removeProperty('cursor');
        this.endMeasure();
    };

    BoxDrawTool.prototype.setupMouseHandler = function() {
        this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.canvasElement[0]);
        this.mouseHandler.setInputAction(_.bind(this.startRectangle, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.mouseHandler.setInputAction(_.bind(this.mouseMove, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.mouseHandler.setInputAction(_.bind(this.endRectangle, this), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };

    BoxDrawTool.prototype.createPoint = function(worldPosition) {
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

    BoxDrawTool.prototype.drawRectangle = function(positions) {
        //positions: array of two Cartesian3
        var dynamicPositions = new Cesium.CallbackProperty(_.bind(function(){
            var pt1 = Cesium.Cartographic.fromCartesian(this.activePoints[0]);
            var pt3 = Cesium.Cartographic.fromCartesian(this.activePoints[1]);
            return Cesium.Cartesian3.fromRadiansArray(
                    [pt1.longitude, pt1.latitude,
                    pt3.longitude+0.0001, pt1.latitude,
                    pt3.longitude+0.0001, pt3.latitude+0.0001,
                    pt1.longitude, pt3.latitude+0.0001,
                    pt1.longitude, pt1.latitude]);
        }, this), false);

        var box;
        box = this.viewer.entities.add({
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: 3,
                material: Cesium.Color.BLACK.withAlpha(0.7)
            },
        });
        return box;
    };

    BoxDrawTool.prototype.generateLabel = function() {
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
                show:true,
                showBackground : true,
                font : '14px monospace',
                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                verticalOrigin : Cesium.VerticalOrigin.TOP,
                pixelOffset : new Cesium.Cartesian2(15, 0),
                eyeOffset : new Cesium.Cartesian3(0,0,-5),
                text: new Cesium.CallbackProperty(
                    _.bind(function() {
                        var sp = Cesium.Cartographic.fromCartesian(this.activePoints[idx]);
                        var ep = Cesium.Cartographic.fromCartesian(this.activePoints[eidx]);
                        var geodesic = new Cesium.EllipsoidGeodesic();
                        geodesic.setEndPoints(sp,ep);
                        var lengthInMeters = Math.round(geodesic.surfaceDistance);
                        return (lengthInMeters / 1000).toFixed(2) + " km\n" +
                        (lengthInMeters * 0.000621371).toFixed(2) + " mi\n" +
                        (lengthInMeters * 0.000539957).toFixed(2) + " N mi";
                    }, this),
                    false
                )
            }
        });
        this.activeLabelEntities.push(newLabel);
        return newLabel;
    };

    BoxDrawTool.prototype.startRectangle = function(movement) {
        //Creates a set of five entities; one floating point (cursor) and four lines.
        //The lines are parallel to lines of longitude and latitude and form a box
        var earthPosition = this.viewer.scene.camera.pickEllipsoid(movement.position);
        // `earthPosition` will be undefined if our mouse is not over the globe.
        if (Cesium.defined(earthPosition)) {
            if (this.activePoints.length === 0) {// first point
                //if this.floatingPoint is defined, then we are currently drawing a rectangle;
                this.floatingPoint = this.createPoint(earthPosition); //adds point to map
                this.activePoints.push(earthPosition);
                this.activePoints.push(earthPosition);
                
                this.heldEnt = this.drawRectangle(this.activePoints); //adds line to map
                this.createPoint(earthPosition)
                this.generateLabel();
            }
        }
    };

    BoxDrawTool.prototype.mouseMove = _.throttle(function(movement) {
        if (Cesium.defined(this.floatingPoint)){
            var newPosition = this.viewer.scene.camera.pickEllipsoid(movement.endPosition);
            if (Cesium.defined(newPosition)) {
                this.floatingPoint.position.setValue(newPosition);
                this.activePoints.pop();
                this.activePoints.push(newPosition);
            }
        }
        this.cesiumView.trigger('requestRender');
    }, 40);

    BoxDrawTool.prototype.endRectangle = function(movement) {
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

    return BoxDrawTool;
});