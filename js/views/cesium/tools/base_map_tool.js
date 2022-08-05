//The 'default' mouse behavior on a cesium map
//This should remain as simple as possible, because
//all Cesium maps would activate this by default
define([
    'jquery',
    'underscore',
    'backbone',
    'cesium'
], function ($, _, Backbone, Cesium) {
    "use strict";
    //TODO Make this into a Backbone.Model derivative for the listenTo functionality
    var BaseMapTool = function(cesiumView) {
        this.cesiumView = cesiumView;
        this.viewer = this.cesiumView.viewer;
        this.canvasElement = $(this.viewer.scene.canvas);
        this.toolName = 'baseMapTool';
        this.iconInToolbox = false;
        this.heldEnt = null;
    };
    BaseMapTool.prototype.activate = function() {
        if (!_.isUndefined(this.mouseHandler)) {
            console.error(this.toolName + ' already activated');
            return;
        }
        this.setupMouseHandler();
    };
    BaseMapTool.prototype.deactivate = function() {
        if (!_.isUndefined(this.mouseHandler)) {
            this.mouseHandler = this.mouseHandler && this.mouseHandler.destroy();
        } else {
            console.error(this.toolName + ' already deactivated');
            return;
        }
    };

    BaseMapTool.prototype.setupMouseHandler = function() {
        this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.canvasElement[0]);
        this.viewer.entities.withLabelOpen = [];
        this.resetEntPickup(null);
    };

    BaseMapTool.prototype.pickupEnt = function(movement, ent) {
        //picks the canvas, and if a pin is hit, attaches it to the mouse cursor
        //also adds handler to place the pin down again
        //this context should always be the Form object
        if (_.isUndefined(ent)) {
            var pickedObjects = this.viewer.scene.drillPick(movement.position);
            if (pickedObjects){
                var pickedObj = _.find(pickedObjects, function(po){return po.id && po.id.movable;}, this);
                if (pickedObj) {
                    ent = pickedObj.id;
                }
            }
        }
        if (ent && ent.movable) {
            ent.show = true;
            if (ent.label) {
                ent.label.show = true;
            }
            ent.prevPosition = Cesium.Cartesian3.clone(ent.position.getValue(Cesium.Iso8601.MINIMUM_VALUE));
            this.heldEnt = ent;
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.mouseHandler.setInputAction(_.bind(this.moveEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.setInputAction(_.bind(this.dropEnt, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.mouseHandler.setInputAction(_.bind(this.cancelEnt, this), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.canvasElement.css('cursor', 'grabbing');
            this.cesiumView.trigger('pickupEnt', ent);
        }
        this.viewer.scene.requestRender();
        return ent;
    };

    BaseMapTool.prototype.resetEntPickup = function(ent) {
            //this context should always be the tool object
            this.canvasElement.css('cursor', 'grab');
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.mouseHandler.setInputAction(_.bind(this.hoverEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.setInputAction(_.bind(this.pickupEnt, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.heldEnt = null;
            this.viewer.scene.requestRender();
            this.cesiumView.trigger('resetEntPickup', ent);
    };

    BaseMapTool.prototype.hoverEnt = _.debounce(function(movement) {
        //this context should always be the Form object
        var pickedObjects = this.viewer.scene.drillPick(movement.endPosition);
        var pickedObj, ent;
        if (pickedObjects.length > 0){
            pickedObj = _.find(pickedObjects, function(po){return po.id && (po.id.movable || po.id.hoverable);}, this);
            this.cesiumView.trigger('hover', pickedObj);
            if (pickedObj) {
                ent = pickedObj.id;
                if (ent.movable) {
                    this.canvasElement.css('cursor', 'grab');
                } else if (ent.hoverable) {
                    this.canvasElement.css('cursor', 'help');
                }
                if (ent.label) {
                    this.viewer.entities.withLabelOpen.push(ent);
                    ent.label.show = true;
                }
                
            }
        }

        if (ent) {
            var toBeClosed = _.difference(this.viewer.entities.withLabelOpen, [ent]);
            if (toBeClosed.length > 0) {
                _.each(toBeClosed, function(ent) {ent.label.show = false;});
                this.viewer.entities.withLabelOpen = [ent];
            }
        } else {
            var cssObject = this.canvasElement.prop('style');
            cssObject.removeProperty('cursor');
            //this.$('.cesium-viewer').css('cursor', 'default');
            _.each(this.viewer.entities.withLabelOpen, function(ent) {ent.label.show = false;});
            this.viewer.entities.withLabelOpen = [];
        }
        this.viewer.scene.requestRender();
    }, 40);
    
    BaseMapTool.prototype.moveEnt = _.debounce(function(movement) {
        //this context should always be the Tool
        var newPos = this.viewer.scene.camera.pickEllipsoid(movement.endPosition);
        //this.position = newPos;
        this.heldEnt.position.setValue(newPos);
        this.viewer.scene.requestRender();
    }, 40);

    BaseMapTool.prototype.dropEnt = function(movement) {
        //this context should always be the Tool
        var newPos = this.viewer.scene.camera.pickEllipsoid(movement.position);
        //this.position = newPos;
        this.heldEnt.position.setValue(newPos);
        var coords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(newPos);
        coords = [Cesium.Math.toDegrees(coords.longitude), Cesium.Math.toDegrees(coords.latitude), 0]; //not coords.height (may not be correct)
        this.cesiumView.trigger('droppedEnt', this.heldEnt, coords);
        this.heldEnt.label.show = false;
        this.viewer.scene.requestRender();
        this.resetEntPickup(this.heldEnt);
    };

    BaseMapTool.prototype.cancelEnt = function(movement, ent) {
        //this context should always be the Form object
        if (ent) {
            if (this.heldEnt !== ent) {
                console.error('something went wrong');
            }
        }
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.mouseHandler.setInputAction(_.bind(this.hoverEnt, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.mouseHandler.setInputAction(_.bind(this.pickupEnt, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.heldEnt.position.setValue(Cesium.Cartesian3.clone(this.heldEnt.prevPosition));
        this.heldEnt.label.show = false;
        this.cesiumView.viewer.scene.requestRender();
        this.cesiumView.trigger('cancelEnt', this.heldEnt);
        this.resetEntPickup(this.heldEnt);
    };
    return BaseMapTool;
});