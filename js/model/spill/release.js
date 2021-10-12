define([
    'underscore',
    'backbone',
    'd3',
    'model/base',
    'moment',
    'cesium',
    'model/visualization/graticule'
], function(_, Backbone, d3, BaseModel, moment, Cesium, Graticule) {
    'use strict';
    var gnomeRelease = BaseModel.extend({
        urlRoot: '/release/',

        defaults: {
            'obj_type': 'gnome.spill.release.PointLineRelease',
            'end_position': [0, 0, 0],
            'start_position': [0, 0, 0],
            'num_elements': 1000,
            'centroid': [0,0,0]
        },

        initialize: function(options) {
            var start_time = '';

            if (_.has(window, 'webgnome') &&
                    _.has(webgnome, 'model') &&
                    !_.isNull(webgnome.model)) {
                start_time = moment(webgnome.model.get('start_time'));
            }
            else {
                start_time = moment();
            }

            if (_.isUndefined(this.get('release_time'))) {
                // Why are we truncating the seconds?
                this.set('release_time', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            }

            var end_time = '';

            if (_.has(window, 'webgnome') &&
                    _.has(webgnome, 'model') &&
                    !_.isNull(webgnome.model)) {
                end_time = start_time.add(webgnome.model.get('duration'), 's');
            }
            else {
                end_time = moment();
            }

            if (_.isUndefined(this.get('end_release_time'))) {
                this.set('end_release_time', end_time.format('YYYY-MM-DDTHH:00:00'));
            }

            if (webgnome.hasModel()) {
                if (webgnome.model.get('name') === 'ADIOS Model_') {
                    this.set('num_elements', 100);
                }
            }

            BaseModel.prototype.initialize.call(this, options);
            this._visObj = this.generateVis();
            this.listenTo(this, 'change:start_position', this.handleVisChange);
            this.listenTo(this, 'change:end_position', this.handleVisChange);
        },

        handleVisChange: function() {
            var startPin = this._visObj.entities.spillPins[0];
            var endPin = this._visObj.entities.spillPins[1];
            startPin.position.setValue(Cesium.Cartesian3.fromDegrees(this.get('start_position')[0], this.get('start_position')[1]));
            endPin.position.setValue(Cesium.Cartesian3.fromDegrees(this.get('end_position')[0], this.get('end_position')[1]));
            if (startPin.position.equals(endPin.position)) {
                endPin.show = false;
            } else {
                endPin.show = true;
            }
        },

        generateVis: function(addOpts) {
            //Generates a CustomDataSource that represent release attributes so it may
            //be displayed in a Cesium viewer
            //addOpts are params to replace the default pin parameters below (such as 'movable')
            if (_.isUndefined(addOpts)) {
                addOpts = {};
            }
            var ds = new Cesium.CustomDataSource(this.get('id') + '_pins');
            var coll = ds.entities;
            coll.spillPins = [];
            var positions = [this.get('start_position'), this.get('end_position')]; //future: this.get('positions')
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
            for (var i = 0; i < num_pins; i++) {
                var newPin = coll.add(_.extend({
                    position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1])),
                    billboard: {
                        image: '/img/spill-pin.png',
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                    },
                    show: true,
                    gnomeModel: this,
                    model_attr : ['start_position', 'end_position'][i], //future: 'positions',
                    coordFormat: 'dms',
                    index: i,
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

            coll.spillLineSegments = [];
            var num_segments = num_pins - 1;
            for (var j = 0; j < num_segments; j++) {
                //add polyline between pins
                coll.spillLineSegments.push(coll.add({
                    polyline: {
                        //positions: spillLinePositionsCallbackGen(coll.spillPins[j], coll.spillPins[j+1]),
                        //positions: new Cesium.ConstantProperty([new Cesium.CallbackProperty(_.bind(function(){return this.position.getValue();}, coll.spillPins[j]), true),
                        //           new Cesium.CallbackProperty(_.bind(function(){return this.position.getValue();}, coll.spillPins[j+1]), true)]),
                        //positions: new Cesium.ConstantProperty([coll.spillPins[j].position, coll.spillPins[j+1].position]),
                        positions: new Cesium.PositionPropertyArray([coll.spillPins[j].position, coll.spillPins[j+1].position]),
                        show: spillLineShowCallbackGen(coll.spillPins[j], coll.spillPins[j+1]),
                        followSurface: true,
                        width: 8.0,
                        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLACK),
                        clampToGround: true

                    },
                }));
            }
            return ds;
        },

        getDuration: function() {
            var startInUnix = moment(this.get('release_time')).unix();
            var endInUnix = moment(this.get('end_release_time')).unix();

            return endInUnix - startInUnix;
        },

        durationShift: function(startTime) {
            var duration = this.getDuration();

            var startObj = moment(startTime);
            this.set('release_time', startTime);

            if (duration>0) {
                var endTime = startObj.add(duration, 's').format();
                this.set('end_release_time', endTime);
            }
            else {
                this.set('end_release_time', startTime);
            }

        },

        validate: function(attrs, options) {
            if (!moment(attrs.release_time).isAfter('1969-12-31')) {
                return 'Spill start time must be after 1970.';
            }

            if (this.validateDuration(attrs)) {
                return this.validateDuration(attrs);
            }

            if (this.validateLocation(attrs)) {
                return this.validateLocation(attrs);
            }
            
        },

        validateLocation: function(attrs) {
            if (_.isUndefined(attrs)) {
                attrs = this.attributes;
            }

            if (parseFloat(attrs.start_position[0]) !== attrs.start_position[0] ||
                    parseFloat(attrs.start_position[1]) !== attrs.start_position[1]) {
                return 'Start position must be in decimal degrees.';
            }

            if (parseFloat(attrs.end_position[0]) !== attrs.end_position[0] ||
                    parseFloat(attrs.end_position[1]) !== attrs.end_position[1]) {
                return 'End position must be in decimal degrees.';
            }

            if (!_.isUndefined(webgnome.model) &&
                    !_.isUndefined(webgnome.model.get('map'))) {
                return this.isReleaseValid(webgnome.model.get('map'));
            }
        },

        isReleaseValid: function(map) {
            var error = 'Start or End position are outside of supported area. Some or all particles may disappear upon release';
            var sp = this.get('start_position');
            var ep = this.get('end_position');
            var start_within = this.testVsSpillableArea(sp, map) && this.testVsMapBounds(sp, map);
            var end_within = this.testVsSpillableArea(ep, map) && this.testVsMapBounds(ep, map);
            if (!start_within || !end_within) {
                return error;
            }
        },

        isReleasePoint: function() {
            var start_point = this.get('start_position');
            var end_point = this.get('end_position');

            if (start_point[0] !== end_point[0] ||
                    start_point[1] !== end_point[1]) {
                return false;
            }

            return true;
        },

        testVsSpillableArea: function(point, map) {
            var sa = map.get('spillable_area');
            if (_.isNull(sa) || _.isUndefined(sa)) {
                // no SA, so all locations are permitted
                return true;
            }
            if (sa[0].length !== 2) { //multiple SA polygons
                for (var i = 0; i < sa.length; i++) {
                    if (d3.polygonContains(sa[i], point)) {
                        return true;
                    }
                }
                return false;
            } else {
                return d3.polygonContains(sa, point);
            }
        },

        testVsMapBounds: function(point, map) {
            var mb = map.get('map_bounds');
            if (_.isNull(mb) || _.isUndefined(mb)) {
                return true;
            }
            return d3.polygonContains(mb, point);
        },

        validateDuration: function(attrs) {
            if (moment(attrs.release_time).isAfter(attrs.end_release_time)) {
                return 'Duration must be a positive value.';
            }
        },
        
        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];

            var elementAmount = this.get('num_elements');
            var name = this.get('name');
            var releaseStart = moment(this.get('release_time')).format('lll');
            var releaseEnd = moment(this.get('end_release_time')).format('lll');
            var numberReleased = this.get('num_released');
            var invalidStart = this.get('start_time_invalid');

            attrs.push({title: 'Name: ' + name,
                        key: 'Name',
                        obj_type: this.get('name'),
                        action: 'edit',
                        object: this});

            attrs.push({title: 'Time of Release: ' + releaseStart,
                        key: 'Time of Release',
                        obj_type: this.get('release_time'),
                        action: 'edit',
                        object: this});

            attrs.push({title: 'End Time of Release: ' + releaseEnd,
                        key: 'End Time of Release',
                        obj_type: this.get('end_release_time'),
                        action: 'edit',
                        object: this});

            attrs.push({title: 'Element Amount: ' + elementAmount,
                        key: 'Element Amount',
                        obj_type: this.get('num_elements'),
                        action: 'edit',
                        object: this});

            attrs.push({title: 'Elements Released: ' + numberReleased,
                        key: 'Elements Released',
                        obj_type: this.get('num_released'),
                        action: 'edit',
                        object: this});

            attrs.push({title: 'Start Time Invalid: ' + invalidStart,
                        key: 'Start Time Invalid',
                        obj_type: this.get('start_time_invalid'),
                        action: 'edit',
                        object: this});

            tree = attrs.concat(tree);

            return tree;
        }

    });

    return gnomeRelease;

});
