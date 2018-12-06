define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'module',
    'd3',
    'views/modal/form',
    'text!templates/form/spill/map.html',
    'text!templates/form/spill/map/controls.html',
    'views/default/cesium',
    'model/map/graticule'
], function($, _, Backbone, Cesium, module, d3, FormModal, MapViewTemplate, MapControlsTemplate, CesiumView, Graticule) {
    'use strict';
    var mapSpillView = FormModal.extend({

        mapShown: false,
        title: 'Spill Location',
        className: 'modal form-modal map-modal-form',
        size: 'lg',

        events: function() {
            return _.defaults({
                'click .spill-button .fixed': 'enablePointMode',
                'click .spill-button .moving': 'enableLineMode',
                'click input': 'switchCoordFormat',
            }, FormModal.prototype.events);
        },

        initialize: function(options, release) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            } else {
                this.model = release;
            }

            

            this.placeMode = 'point';
            this.heldPin = null;
            this.origModel = this.model;
        },

        render: function(options) {
            var cid = this.model.cid;
            this.body = _.template(MapViewTemplate, {
                cid: cid
            });
            FormModal.prototype.render.call(this, options);
            this.mapView = new CesiumView();
            this.$('#spill-form-map-' + this.model.cid).append(this.mapView.$el);
            this.mapView.render();
            this.addMapControls();

            this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.mapView.viewer.scene.canvas);

            var map = webgnome.model.get('map');
            map.getGeoJSON().then(_.bind(function(data){
                map.processMap(data, null, this.mapView.viewer.scene.primitives);
            }, this));
            this.mapView.resetCamera(map);

            this._spillPins = [];
            var positions = [this.model.get('start_position'), this.model.get('end_position')]; //future: this.model.get('positions')
            var num_pins = positions.length;
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
                        var ttstr = 'Lon: ' + ('\t' + lon) +
                                '\nLat: ' + ('\t' + lat);
                        return ttstr;
                    }, newPin),
                    true
                );
            };
            for (var i = 0; i < num_pins; i++) {
                this.listenTo(this.model, 'change:' + ['start_position', 'end_position'][i] + i, _.bind(this.resetPinPickup, this));
                var newPin = this.mapView.viewer.entities.add({
                    id: i,
                    position: Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]),
                    billboard: {
                        image: '/img/spill-pin.png',
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                    },
                    show: false,
                    gnomeModel: this.model,
                    model_attr : ['start_position', 'end_position'][i], //future: 'positions',
                    coordFormat: 'dms',
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
                newPin.label.text = textPropFuncGen(newPin);
                this._spillPins.push(newPin);
            }

            var spillLinePositionsCallbackGen = function(p1, p2){
                return new Cesium.CallbackProperty(
                    _.partial(function(pin1, pin2) {
                        return [p1.position._value, p2.position._value];
                        //return _.pluck(_.pluck(this, 'position'),'_value');
                    }, p1, p2),
                    false
                );
            };

            var spillLineShowCallbackGen = function(p1, p2) {
                return new Cesium.CallbackProperty(
                    _.partial(function(pin1, pin2) {
                        return pin1.show && pin2.show;
                    }, p1, p2),
                    false
                );
            };

            this._spillLineSegments = [];
            var num_segments = num_pins - 1;
            for (var j = 0; j < num_segments; j++) {
                //add polyline between pins
                this._spillLineSegments.push(this.mapView.viewer.entities.add({
                    polyline: {
                        positions: spillLinePositionsCallbackGen(this._spillPins[j], this._spillPins[j+1]),
                        show: spillLineShowCallbackGen(this._spillPins[j], this._spillPins[j+1]),
                        followSurface: true,
                        width: 8.0,
                        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLACK),
                        clampToGround: true
                        
                    },
                }));
            }


            this.resetPinPickup(); //binds input actions
            var samePositions = _.every(positions, function(pos) {return _.isEqual(pos, positions[0]);});
            if (!samePositions) {
                this.enableLineMode();
                _.each(this._spillPins, function(sp){sp.show = true;});
                if (_.isEqual(positions[0], [0,0,0])) {
                    this.pickupPin(null, this._spillPins[0]);
                }
            } else {
                this.enablePointMode();
            }

            //this.renderSpillFeature();
            //this.toggleSpill();
        },

        pickupPin: function(movement, ent) {
            //picks the canvas, and if a pin is hit, attaches it to the mouse cursor
            //also adds handler to place the pin down again
            //this context should always be the Form object
            if (_.isUndefined(ent)) {
                var pickedObjects = this.mapView.viewer.scene.drillPick(movement.position);
                if (pickedObjects){
                    var pickedObj = _.find(pickedObjects, function(po){return _.contains(this._spillPins, po.id);}, this);
                    if (pickedObj) {
                        ent = pickedObj.id;
                    }
                }
            }
            if (ent) {
                console.log(d3);
                ent.show = true;
                ent.label.show = true;
                this.heldPin = ent;
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.movePin, ent), _, this.mapView.viewer.scene), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.stickPin, ent), _, this.mapView.viewer.scene), Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.mouseHandler.setInputAction(_.partial(_.bind(this.cancelPin, this), _, ent), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                if (this.placeMode === 'point' && !this.$('.fixed').hasClass('on')) {
                    this.$('.fixed').addClass('on');
                    this.$('.fixed').tooltip('show');
                } else if (this.placeMode === 'line' && !this.$('.moving').hasClass('on')){
                    this.$('.moving').addClass('on');
                    this.$('.moving').tooltip('show');
                }
                this.$('.cesium-viewer').css('cursor', 'grabbing');
            }
            this.mapView.viewer.scene.requestRender();
        },

        hoverPin: function(movement) {
            //this context should always be the Form object
            var pickedObjects = this.mapView.viewer.scene.drillPick(movement.endPosition);
            if (pickedObjects.length > 0){
                var pickedObj = _.find(pickedObjects, function(po){return _.contains(this._spillPins, po.id);}, this);
                if (pickedObj) {
                    this.$('.cesium-viewer').css('cursor', 'grab');
                    pickedObj.id.label.show = true;
                }
            } else {
                _.each(this._spillPins, function(p){p.label.show = false;});
                this.$('.cesium-viewer').css('cursor', 'default');
            }
            this.mapView.viewer.scene.requestRender();
        },

        movePin: function(movement, scene) {
            //this context should always be a pin entity
            var newPos = scene.camera.pickEllipsoid(movement.endPosition);
            this.position = newPos;
            scene.requestRender();
        },

        stickPin: function(movement, scene) {
            //this context should always be a pin entity
            var newPos = scene.camera.pickEllipsoid(movement.position);
            this.position = newPos;
            var coords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(newPos);
            var old_coords = this.gnomeModel.get(this.model_attr); //future: this.gnomeModel.get(this.model_attr)[this.id]
            coords = [Cesium.Math.toDegrees(coords.longitude), Cesium.Math.toDegrees(coords.latitude), old_coords[2]];
            this.gnomeModel.set(this.model_attr, coords); //future: need to get old coords like in cancelPin
            this.gnomeModel.trigger('change:' + this.model_attr + this.id, this);
            this.label.show = false;
            scene.requestRender();
        },

        cancelPin: function(movement, ent) {
            //this context should always be the Form object
            if (ent) {
                if (this.heldPin !== ent) {
                    console.error('something went wrong');
                }
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                this.mouseHandler.setInputAction(_.bind(this.hoverPin, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.mouseHandler.setInputAction(_.bind(this.pickupPin, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
                var positions = [this.model.get('start_position'), this.model.get('end_position')]; //future: this.model.get('positions')
                var oldPos = positions[ent.id];
                oldPos = new Cesium.Cartesian3.fromDegrees(oldPos[0], oldPos[1]);
                ent.position = oldPos;
                ent.label.show = false;
                this.mapView.viewer.scene.requestRender();
                this.resetPinPickup(ent);
            }
        },

        resetPinPickup: function(ent) {
            //this context should always be the Form object
            var btn_name;
            this.$('.cesium-viewer').css('cursor', 'grab');
            if (ent) {
                if (this.placeMode === 'point') {
                    btn_name = '.fixed';
                    this.model.set('end_position', this.model.get('start_position'));
                    _.each(this._spillPins, _.bind(function(sp) {sp.position = this._spillPins[0].position;}, this));
                } else {
                    btn_name = '.moving';
                    var nextIdx = ent.id+1;
                    ent.label.show = false;
                    if (nextIdx < this._spillPins.length) {
                        this._spillPins[nextIdx].label.show = true;
                        this.pickupPin(null, this._spillPins[nextIdx]);
                        return;
                    }
                }
            }
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.mouseHandler.setInputAction(_.bind(this.hoverPin, this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mouseHandler.setInputAction(_.bind(this.pickupPin, this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.heldPin = null;
            this.mapView.viewer.scene.requestRender();
        },

        enablePointMode: function(e) {
            if (!_.isNull(this.heldPin)) {
                this.cancelPin(null, this.heldPin);
            }
            this.placeMode = 'point';
            this.$('.moving').removeClass('on');
            this.$('.moving').tooltip('hide');
            var bt = this.$('.fixed');
            _.each(this._spillPins, function(sp){sp.show = false;});
            this._spillPins[0].show = true;
            this.pickupPin(null, this._spillPins[0]);
    },

        enableLineMode: function(e) {
            if (!_.isNull(this.heldPin) && !_.isEqual(this.model.get('start_position'), [0,0,0])) {
                this.cancelPin(null, this.heldPin);
            }
            this.placeMode = 'line';
            this.$('.fixed').removeClass('on');
            this.$('.fixed').tooltip('hide');
            var bt = this.$('.moving');
            this.$('.moving').addClass('on');
            this.$('.moving').tooltip('show');
            this.mapView.viewer.scene.requestRender();
        },

        switchCoordFormat: function(e) {
            _.each(this._spillPins, function(p){p.coordFormat = e.currentTarget.getAttribute('value');});
        },

        addMapControls: function(){
            var controls = _.template(MapControlsTemplate, {});
            this.$('.cesium-viewer').append(controls);
            this.$('[data-toggle="tooltip"]').tooltip({placement: 'right', trigger: 'hover click'});
        },

        save: function() {
            var err = this.model.validateLocation();
            if (err) {
                this.error("Placement error!", err);
            } else {
                this.clearError();
                this.trigger('save');
                this.hide();
            }
        },

        wizardclose: function() {
            this.model = this.origModel;
            this.trigger('wizardclose');
        },

        close: function(){
            if (!_.isUndefined(this.spillMapView)){
                this.spillMapView.close();
            }
            
            FormModal.prototype.close.call(this);
        }
    });

    return mapSpillView;
});
