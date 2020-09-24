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
    'model/visualization/spatial_release_appearance'
], function($, _, Backbone, d3, BaseModel, moment, localforage, Cesium, Graticule, SpatialReleaseAppearance) {
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

            this.on('change', this.resetRequest, this);

            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this, 'change:custom_positions', this.handleVisChange);
        },

        resetRequest: function() {
            this.requested = false;
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
                            this.requesting = false;
                            this.requested_lines = true;
                            var lengths = lineData[0];
                            var weights = lineData[1];
                            var thicknesses = lineData[2];
                            var lines = lineData[3];
                            var lineDtype = Float32Array;
                            this._lineLengths = lengths;
                            this._weights = weights;
                            this._thicknesses = thicknesses;
                            this._lines = new lineDtype(lines, 0);
                            resolve([this._lineLengths, this._lines]);
                        } else {
                            if(!this.requesting && !this.requested_lines){
                                var ur = this.urlRoot + this.id + '/polygons';
                                this.requesting = true;
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
                                            this.requested_lines = true;
                                            var num_lengths = parseInt(response.getResponseHeader('num_lengths'));
                                            var lenDtype = Int32Array;
                                            var lineDtype = Float32Array;
                                            var lenDtl = lenDtype.BYTES_PER_ELEMENT;
                                            this._lineLengths = new lenDtype(lines, 0, num_lengths);
                                            this._lines = new lineDtype(lines, num_lengths*lenDtl);
                                            this.sr_cache.setItem(this.id + 'lines', [lines, num_lengths]);
                                            resolve([this._lineLengths, this._lines]);
                                        },this),
                                        error: function(jqXHR, sts, err){reject(err);},
                                });
                            } else {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    },this)).catch(reject);
                },this));
            } 
            return this._getLinesPromise;
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