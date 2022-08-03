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
    var release = BaseModel.extend({
        urlRoot: '/release/',

        defaults: {
            'obj_type': 'gnome.spills.release.Release',
            'num_elements': 1000,
            'custom_positions': [[0, 0, 0],],
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
            //this.listenTo(this, 'change:start_position', this.handleVisChange);
            //this.listenTo(this, 'change:end_position', this.handleVisChange);
        },

        generateVis: function(addOpts) {
            //Generates a CustomDataSource that represent release attributes so it may
            //be displayed in a Cesium viewer
            //addOpts are params to replace the default pin parameters below (such as 'movable')
            if (_.isUndefined(addOpts)) {
                addOpts = {};
            }
            var ds = new Cesium.CustomDataSource(this.get('id') + '_points');
            var coll = ds.entities;
            coll.releasePoints = [];
            var positions = this.get('custom_positions');
            var num_points = positions.length;

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
            for (var i = 0; i < num_points; i++) {
                var newPt = coll.add(_.extend({
                    position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1])),
                    billboard: {
                        image: '/img/tinycrosshair.png',
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                    },
                    show: true,
                    gnomeModel: this,
                    model_attr : 'custom_positions', //future: 'positions',
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
                newPt.label.text = textPropFuncGen(newPt);
                coll.releasePoints.push(newPt);
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

            if (!_.isUndefined(webgnome.model) &&
                    !_.isUndefined(webgnome.model.get('map'))) {
                return this.isReleaseValid(webgnome.model.get('map'));
            }
        },

        isReleaseValid: function(map) {
            var error = 'At least one release position is outside of supported area. Some or all particles may disappear upon release';
            var c_pos = this.get('custom_positions');
            var pos;
            for(var i = 0; i < c_pos.length; i++){
                pos = c_pos[i];
                if (!(this.testVsSpillableArea(pos, map) && this.testVsMapBounds(pos, map))){
                    return error;
                }
            }
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

    return release;

});
