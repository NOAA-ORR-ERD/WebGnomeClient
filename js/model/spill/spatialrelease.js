define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'model/base',
    'moment',
    'localforage',
    'cesium',
    'model/visualization/graticule',
    'model/visualization/spatial_release_appearance',
    'model/visualization/editablePolygon'
], function($, _, Backbone, d3, BaseModel, moment, localforage,
    Cesium, Graticule, SpatialReleaseAppearance, EditPolygon) {
    'use strict';
    var spatialRelease = BaseModel.extend({
        urlRoot: '/release/',

        defaults: function() {
            return {
                obj_type: 'gnome.spill.release.SpatialRelease',
                num_elements: 1000,
                _appearance: new SpatialReleaseAppearance()
            };
        },
        sr_cache : localforage.createInstance({name: 'SpatialRelease Data Cache',
                                                 }),

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

            var end_time = start_time;

            if (_.isUndefined(this.get('end_release_time'))) {
                this.set('end_release_time', end_time.format('YYYY-MM-DDTHH:00:00'));
            }

            if (webgnome.hasModel()) {
                if (webgnome.model.get('name') === 'ADIOS Model_') {
                    this.set('num_elements', 100);
                }
            }

            BaseModel.prototype.initialize.call(this, options);

            this.on('change', this.resetRequest, this);

            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this, 'change:custom_positions', this.handleVisChange);
        },

        resetRequest: function() {
            this.requested = false;
        },

        getMetadata: function() {
            if (_.isUndefined(this._getMetadataPromise)){
                this._getMetadataPromise = new Promise(_.bind(function(resolve, reject){
                    if (!_.isUndefined(this._metadata)) {
                        resolve(this._metadata);
                    }
                    var ur = this.urlRoot + this.id + '/metadata';
                    this.requesting = true;
                    $.ajax({url: ur,
                        type: "GET",
                        dataType: "json",
                        processData:"false",
                        xhrFields:{
                            withCredentials: true
                        },
                        success: _.bind(function(json_, sts, response){
                            console.log(json_);
                            this._metadata = json_;
                            this.weights = json_.weights;
                            this.thicknesses = json_.thicknesses;
                        },this),
                        error: function(jqXHR, sts, err){
                            this.requesting = false;
                            this.requested_metadata = false;
                            reject(err);
                        },
                    });
                },this));
            } 
            return this._getLinesPromise;
        },

        getPolygons: function() {
            /*
            Gets the polygons of the SpatialRelease from the server. Use the 'num_polys' header to split the response into
            two ArrayBuffers. The first array is of integer line lengths that sequentially index
            the second array, which are lon/lat pairs that form points of a line. When all such lines are
            drawn, the grid image is complete. Do not override this function; all grids must provide line data
            in this format to be drawn on the Cesium canvas.
            */
            if (_.isUndefined(this._getLinesPromise)) {
                this._getLinesPromise = new Promise(_.bind(function(resolve, reject){
                    if (!_.isUndefined(this._lineLengths) && !_.isUndefined(this._lines)) {
                        resolve([this._lineLengths, this._lines]);
                    }
                    this.sr_cache.getItem(this.id + 'polygons').then(_.bind(function(lineData){
                        if(lineData) {
                            console.log(this.id + ' polygons found in store');
                            var num_lengths = lineData[1];
                            var lines = lineData[0];
                            var lenDtype = Int32Array;
                            var lenDtl = lenDtype.BYTES_PER_ELEMENT;
                            this._lineLengths = new lenDtype(lines, 0, num_lengths);
                            var lineDtype = Float32Array;
                            this._lines = new lineDtype(lines, num_lengths*lenDtl);
                            resolve([this._lineLengths, this._lines]);
                        } else {
                            var ur = this.urlRoot + this.id + '/polygons';
                            $.ajax({url: ur,
                                type: "GET",
                                dataType: "binary",
                                responseType:"arraybuffer",
                                processData:"false",
                                headers: {
                                    'Accept' : 'application/octet-stream',
                                    'Access-Control-Allow-Request-Method': 'GET',
                                    'Content-Type': 'binary',
                                },
                                xhrFields:{
                                    withCredentials: true
                                },
                                success: _.bind(function(lines, sts, response){
                                    this.requesting = false;
                                    this.requested_polygons = true;
                                    var num_lengths = parseInt(response.getResponseHeader('num_lengths'));
                                    var lenDtype = Int32Array;
                                    var lineDtype = Float32Array;
                                    var lenDtl = lenDtype.BYTES_PER_ELEMENT;
                                    this._lineLengths = new lenDtype(lines, 0, num_lengths);
                                    this._lines = new lineDtype(lines, num_lengths*lenDtl);
                                    this.sr_cache.setItem(this.id + 'lines', [lines, num_lengths]);
                                    resolve([this._lineLengths, this._lines]);
                                },this),
                                error: function(jqXHR, sts, err){
                                    this.requesting = false;
                                    this.requested_polygons = false;
                                    reject(err);
                                },
                            });
                        }
                    },this)).catch(reject);
                },this));
            } 
            return this._getLinesPromise;
        },

        processPolygons: function(viewer, data) {
            //creates the polygon entities and adds them to the provided EntityCollection
            if (_.isUndefined(data)) {
                data = (this._lineLengths, this._lines);
            }
            if (_.isUndefined(viewer)) {
                console.error('no viewer!');
                return;
            }
            if (!this.requested_polygons || !this.requested_metadata) {
                console.error('polygons or metadata not received yet');
            }
            var polygons = [];
            var polydata = data[1];
            var lengths = data[0];
            var cur_idx = 0;
            var i, j, polyPositions;
            var scratchN = new Cesium.Cartesian3(0,0,0);
            var weights = this._metadata.weights;
            for (i = 0; i < lengths.length; i++) {
                polyPositions = [];
                for (j = cur_idx; cur_idx < j + lengths[i]*2; cur_idx+=2) {
                    polyPositions.push(Cesium.Cartesian3.fromDegrees(polydata[cur_idx], polydata[cur_idx+1], 0, Cesium.Ellipsoid.WGS84));
                }
                polygons.push(new EditPolygon({
                    positions: polyPositions,
                    showVerts: false,
                    weight: weights[i]
                }));
                viewer.dataSources.add(polygons[polygons.length-1]);
            }
        },

        getBoundingRectangle: function() {
            return new Promise(_.bind(function(resolve, reject) {
                var genRect = _.bind(function(data){
                    this._boundingRectangle = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(data[1]));
                    resolve(this._boundingRectangle);
                }, this);
                this.getPolygons().then(genRect);
            }, this));
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
            if (this.validateDuration(attrs)) {
                return this.validateDuration(attrs);
            }

            if (this.validateLocation(attrs)) {
                return this.validateLocation(attrs);
            }
            
            if (!moment(attrs.release_time).isAfter('1969-12-31')) {
                return 'Spill start time must be after 1970.';
            }
                
        },

        validateLocation: function(attrs) {
            if (_.isUndefined(attrs)) {
                attrs = this.attributes;
            }
            return true;
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
            return false;
        },

        testVsSpillableArea: function(point, map) {
            return true;
            /*
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
            */
        },

        testVsMapBounds: function(point, map) {
            return true;
            /*
            var mb = map.get('map_bounds');
            if (_.isNull(mb) || _.isUndefined(mb)) {
                return true;
            }
            return d3.polygonContains(mb, point);
            */
        },

        validateDuration: function(attrs) {
            if (moment(attrs.release_time).isAfter(attrs.end_release_time)) {
                return 'Duration must be a positive value.';
            }
        },
    });

    localforage.config({
        name: 'WebGNOME Map Cache',
        storeName: 'spatialRelease_cache'
    });

    return spatialRelease;
});