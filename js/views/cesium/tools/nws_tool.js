define([
    'jquery',
    'underscore',
    'cesium',
    'views/cesium/tools/base_map_tool',
    'model/visualization/graticule'
], function ($, _, Cesium, BaseMapTool, Graticule) {
    "use strict";
    var NWSTool = function(cesiumView) {/*
        this.cesiumView = cesiumView;
        this.viewer = this.cesiumView.viewer;
        this.canvasElement = $(this.viewer.scene.canvas);
        this.heldEnt = null;*/
        BaseMapTool.call(this, cesiumView);
        this.toolName = 'NWSTool';
        this.NWSposition = {longitude: 0, latitude:0};
    };

    NWSTool.genToolTip = function(elem) {
        var opts = {
            "title": 'NWS',
            "html": true,
            "container": elem,
            "placement": "right",
            "trigger": "hover"
        };
        if ($(elem).parent().hasClass('right-content-pane')) {
            opts.placement = 'left';
        }
        return opts;
    };

    NWSTool.prototype.activate = function() {
        if (!_.isUndefined(this.mouseHandler)) {
            console.error(this.toolName + ' already activated');
            return;
        }
        this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.canvasElement[0]);
        this.canvasElement.css('cursor', 'default');
        this.setupTool();
    };

    NWSTool.prototype.deactivate = function() {
        BaseMapTool.prototype.deactivate.call(this);
        this.canvasElement.prop('style').removeProperty('cursor');
        this.viewer.entities.remove(this.heldEnt);
        this.viewer.entities.remove(this.pin);
    };

    NWSTool.prototype.setupTool = function() {
        var textPropFuncGen = function(coordFormat, ent) {
            return new Cesium.CallbackProperty(
                function(){
                    var loc = Cesium.Ellipsoid.WGS84.cartesianToCartographic(ent.position._value);
                    var lon, lat;
                    if (coordFormat === 'dms') {
                        lon = Graticule.prototype.genDMSLabel('lon', loc.longitude);
                        lat = Graticule.prototype.genDMSLabel('lat', loc.latitude);
                    } else {
                        lon = Graticule.prototype.genDegLabel('lon', loc.longitude);
                        lat = Graticule.prototype.genDegLabel('lat', loc.latitude);
                    }
                    var ttstr = 'Lon: ' + ('\t' + lon) +
                            '\nLat: ' + ('\t' + lat);
                    return ttstr;
                },
                true
            );
        };
        this.pin = this.viewer.entities.add({
            position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(0,0)),
            billboard: {
                image: '/img/spill-pin.png',
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER
            },
            show: false,
            movable: true,
            hoverable: true,
            label : {
                show : true,
                showBackground : true,
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
                font : '14px monospace',
                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                verticalOrigin : Cesium.VerticalOrigin.TOP,
                pixelOffset : new Cesium.Cartesian2(2, 0),
                eyeOffset : new Cesium.Cartesian3(0,0,-5),
            }
        });
        this.pin.label.text = textPropFuncGen('dms', this.pin)
        this.heldEnt = this.viewer.entities.add({
            position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(0,0)),
            billboard: {
                image: '/img/crosshair.png',
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                width: 30,
                height: 30,
            },
            show: true,
            movable: true,
            label:{
                show : true,
                showBackground : true,
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
                font : '14px monospace',
                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                verticalOrigin : Cesium.VerticalOrigin.TOP,
                pixelOffset : new Cesium.Cartesian2(2, 0),
                eyeOffset : new Cesium.Cartesian3(0,0,-5),
            }
        });
        this.heldEnt.label.text = textPropFuncGen('dms', this.heldEnt);
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.mouseHandler.setInputAction(_.bind(this.moveEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.mouseHandler.setInputAction(_.bind(this.pickLocation, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };

    NWSTool.prototype.moveEnt = _.throttle(function(movement) {
        //this context should always be the Tool
        var newPos = this.viewer.scene.camera.pickEllipsoid(movement.endPosition);
        //this.position = newPos;
        this.heldEnt.position.setValue(newPos);
        this.viewer.scene.requestRender();
    }, 40);

    NWSTool.prototype.pickLocation = function(movement) {
        // Moves the pin to the location clicked, showing if it hidden (first time click)
        // and triggers a 'positionPicked' event on the CesiumView, providing the {lon:, lat:} of the
        // picked location
        var earthPosition = this.viewer.scene.camera.pickEllipsoid(movement.position);
        // `earthPosition` will be undefined if our mouse is not over the globe.
        if (Cesium.defined(earthPosition)) {
            this.pin.position = earthPosition;
            if (!this.pin.show) {
                this.pin.show = true;
            }
            var cartoPos = Cesium.Cartographic.fromCartesian(earthPosition);
            this.cesiumView.trigger('positionPicked', {lon: cartoPos.longitude*180/3.1415, lat: cartoPos.latitude*180/3.1415});
        }
    }
    return NWSTool;
});