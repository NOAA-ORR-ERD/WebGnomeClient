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
                obj_type: 'gnome.spills.release.PolygonRelease',
                num_elements: 1000,
                features: {},
                centroid: [0,0,0],
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
            this._visObj = this.generateVis();
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this, 'change:features', this.updateVis);
            this.listenTo(this, 'change:centroid', this.updateVis);
        },

        resetRequest: function() {
            this.requested = false;
        },

        updateVis: function() {
            if (this._visObj.then){
                this._visObj.then(_.bind(function(visObj){
                    var ents = visObj.polygons;
                    var thicknesses = this.get('thicknesses');
                    for (var i = 0; i < thicknesses.length; i++) {
                        for (var j = 0; j < ents.length; j++) {
                            if (ents[j].properties.feature_index.getValue() === i){
                                ents[j].properties.thickness = thicknesses[i];
                            }
                        }
                    }
                    
                    visObj.spillPins[0].position.setValue(Cesium.Cartesian3.fromDegrees(this.get('centroid')[0], this.get('centroid')[1]));
                },this));
            }
        },

        genCesiumObject: function(options) { //TODO: Delete? Unused function?
            //Common API call for Models to provide a Cesium object to represent themselves
            //Return value is a Promise that resolves to an Object with the following attributes:
            //{type: [DataSource, EntityCollection, Entity, Primitive]
            // obj: <Cesium Object>,
            // model: <Webgnome Model>}
            var prom = new Promise(_.bind(function(resolve, reject){
                resolve();
            }, this));
            return prom;
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
/*
        processPolygons: function(data) {
            //creates the polygon entities and returns a CustomDataSource
            if (_.isUndefined(data)) {
                data = (this._lineLengths, this._lines);
            }
            if (!this.requested_polygons || !this.requested_metadata) {
                console.error('polygons or metadata not received yet');
            }
            var polygons = [];
            var polydata = data[1];
            var lengths = data[0];
            var cur_idx = 0;
            var i, j, k, polyPositions;
            var thicknesses = this._metadata.thicknesses;
            var releaseDS = new Cesium.CustomDataSource(this.get('id') + '_polygons');
            for (i = 0; i < lengths.length; i++) {
                polyPositions = [];
                for (j = cur_idx; cur_idx < j + lengths[i]*2; cur_idx+=2) {
                    polyPositions.push(Cesium.Cartesian3.fromDegrees(polydata[cur_idx], polydata[cur_idx+1], 0, Cesium.Ellipsoid.WGS84));
                }
                polygons.push(new EditPolygon({
                    index: i,
                    positions: polyPositions,
                    showVerts: false,
                    thickness: thicknesses[i],
                    colormap: this.get('_appearance').get('colormap')
                }));
                for (k=0; k < polygons[i].entities.length; k++) {
                    releaseDS.entities.add(polygons[i].entities[k]);
                }
            }
            return releaseDS;
        },
*/
        processPolygons: function(data) {
            var releaseDS = new Cesium.GeoJsonDataSource(this.get('id') + '_polygons');
            var rv = releaseDS.load(
                this.get('features')
                //load, then post-process
            ).then(_.bind(function(ds) {
                var cmp = this.get('_appearance').get('colormap');
                var handlerfunc = function(e, name, args){
                    if (name !== 'properties'){
                        return true;
                    }
                    e.polygon.material.color.setValue(
                        Cesium.Color.DARKGRAY.withAlpha(cmp.numScale(e.properties.thickness))
                    );
                };
                ds.polygons = [];
                for (var i = 0; i < ds.entities.values.length; i++){
                    var ent = ds.entities.values[i];
                    //Setup the polygon color
                    var polycolor = new Cesium.ColorMaterialProperty(
                        Cesium.Color.DARKGRAY.withAlpha(cmp.numScale(ent.properties.thickness))
                    );
                    ent.polygon.material = polycolor;
                    ent.polygon.outlineColor = polycolor.color.getValue();

                    //Attach listener for thickness
                    ent.definitionChanged.addEventListener(handlerfunc, ent);
                    ds.polygons.push(ent);
                }
                // return the dataSource so the returned Promise has the right result
                return ds;
            }, this));
            return rv;
        },

        generateVis: function(addOpts) {
            if (this.isNew()) {
                return undefined;
            }
            return Promise.all([this.getPolygons(), this.getMetadata()])
            .then(_.bind(function(data){
                    var dataSourcePromise = this.processPolygons(data[0]);
                    dataSourcePromise.then(_.bind(function(ds){
                        // Add pin to datasource entities and add it to spillPins attribute
                        var coll = ds.entities;
                        var centroid = this.get('centroid');
                        ds.spillPins = []; //because base release uses an array for this attribute
    
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
                        var newPin = coll.add(_.extend({
                            position: new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(centroid[0], centroid[1])),
                            billboard: {
                                image: '/img/spill-pin.png',
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                            },
                            show: true,
                            gnomeModel: this,
                            model_attr : 'centroid',
                            coordFormat: 'dms',
                            index: 0,
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
                        
                        return ds;

                    }, this));
                    
                    return dataSourcePromise;
                }, this)
            ).catch(console.log);
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
            //return true;
            return;
        },

        isReleaseValid: function(map) {
            var error = 'Start or End position are outside of supported area. Some or all particles may disappear upon release';
            var cent = this.get('centroid');
            cent = this.testVsSpillableArea(cent, map) && this.testVsMapBounds(cent, map);
            if (!cent) {
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