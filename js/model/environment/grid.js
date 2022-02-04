define([
    'underscore',
    'jquery',
    'backbone',
    'cesium',
    'model/base',
    'moment',
    'localforage',
    'model/visualization/grid_appearance'
], function(_, $, Backbone, Cesium, BaseModel, moment, localforage, GridAppearance){
    'use strict';
    var baseGridObj = BaseModel.extend({
        urlRoot: '/grid/',
        grid_cache : localforage.createInstance({name: 'Grid Object Data Cache',
                                                    }),
        defaults: function() {
            return {
                _appearance: new GridAppearance()
            };
        },

        model: {
            _appearance: GridAppearance
        },

        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
            this.on('change', this.resetRequest, this);
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
            this.getMetadata();
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this._linesPrimitive = new Cesium.PrimitiveCollection();
            this.setupVis();
        },

        setupVis: function(attrs) {
            this._linesPrimitive.show = this.get('_appearance').get('on');
        },

        resetRequest: function(){
            this.requested = false;
        },

        getMetadata: function() {
            var url = this.urlRoot + this.id + '/metadata';
            $.get(url, null, _.bind(function(metadata){
                this.metadata = metadata;
            }, this ));
        },

        getBoundingRectangle: function() {
            return new Promise(_.bind(function(resolve, reject) {
                var genRect = _.bind(function(data){
                    this._boundingRectangle = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(data[1]));
                    resolve(this._boundingRectangle);
                }, this);
                this.getLines().then(genRect);
            }, this));
        },

        getNodes: function(){
            /*
            Gets the nodes of the grid from the server. Until we add subclasses for the different grid types,
            the data received will always be a Nx2 array of points (lon0, lat0, lon1, lat1, ..., lonN, latN)
            */
            if (_.isUndefined(this._getNodesPromise)) {
                this._getNodesPromise = new Promise(_.bind(function(resolve, reject){
                    this.grid_cache.getItem(this.id + 'nodes').then(_.bind(function(value){
                        if(value) {
                            console.log(this.id + ' nodes found in store');
                            this.requesting = false;
                            this.requested_nodes = true;
                            this.nodes = value;
                            resolve(this.nodes);
                        } else {
                            if(!this.requesting && !this.requested_nodes){
                                this.requesting = true;
                                var ur = this.urlRoot + this.id + '/nodes';
                                $.ajax({
                                    url: ur,
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
                                    success: _.bind(function(nodes, sts, response){
                                        this.requesting = false;
                                        this.requested_nodes = true;
                                        var dtype = Float32Array;
                                        var dtl = dtype.BYTES_PER_ELEMENT;
                                        var num_nodes = nodes.byteLength / (2*dtl);
                                        this.nodes = new dtype(nodes);
                                        this.grid_cache.setItem(this.id + 'nodes', this.nodes);
                                        resolve(this.nodes);
                                    }, this),
                                    error: function(jqXHR, sts, err){reject(err);},
                                });
                            } else {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    }, this)).catch(reject);
                }, this));
            }
            return this._getNodesPromise;
        },

        getCenters: function(){
            /*
            Gets the centers of the grid from the server. Until we add subclasses for the different grid types,
            the data received will always be a Nx2 array of points (lon0, lat0, lon1, lat1, ..., lonN, latN)
            */
            if (_.isUndefined(this._getCentersPromise)) {
                this._getCentersPromise = new Promise(_.bind(function(resolve, reject){
                    this.grid_cache.getItem(this.id + 'centers').then(_.bind(function(value){
                        if(value) {
                            console.log(this.id + ' centers found in store');
                            this.requesting = false;
                            this.requested_centers = true;
                            this.centers = value;
                            resolve(this.centers);
                        } else {
                            if(!this.requesting && !this.requested_centers){
                                this.requesting = true;
                                var ur = this.urlRoot + this.id + '/centers';
                                $.ajax({
                                    url: ur,
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
                                    success: _.bind(function(centers, sts, response){
                                        this.requesting = false;
                                        this.requested_centers = true;
                                        var dtype = Float32Array;
                                        var dtl = dtype.BYTES_PER_ELEMENT;
                                        var num_centers = centers.byteLength / (2*dtl);
                                        this.centers = new dtype(centers);
                                        this.grid_cache.setItem(this.id + 'centers', this.centers);
                                        resolve(this.centers);
                                    }, this),
                                    error: function(jqXHR, sts, err){reject(err);},
                                });
                            } else {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    }, this)).catch(reject);
                }, this));
            }
            return this._getCentersPromise;
        },

        getLines: function(){
            /*
            Gets the lines of the grid from the server. Use the 'num_lengths' header to split the response into
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
                    this.grid_cache.getItem(this.id + 'lines').then(_.bind(function(lineData){
                        if(lineData) {
                            console.log(this.id + ' lines found in store');
                            this.requesting = false;
                            this.requested_lines = true;
                            var num_lengths = lineData[1];
                            var lines = lineData[0];
                            var lenDtype = Int32Array;
                            var lenDtl = lenDtype.BYTES_PER_ELEMENT;
                            this._lineLengths = new lenDtype(lines, 0, num_lengths);
                            var lineDtype = Float32Array;
                            this._lines = new lineDtype(lines, num_lengths*lenDtl);
                            resolve([this._lineLengths, this._lines]);
                        } else {
                            if(!this.requesting && !this.requested_lines){
                                var ur = this.urlRoot + this.id + '/lines';
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
                                            var lenDtl = lenDtype.BYTES_PER_ELEMENT;
                                            this._lineLengths = new lenDtype(lines, 0, num_lengths);
                                            var lineDtype = Float32Array;
                                            this._lines = new lineDtype(lines, num_lengths*lenDtl);
                                            this.grid_cache.setItem(this.id + 'lines', [lines, num_lengths]);
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

        renderLines: function(rebuild) {
            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild || this._linesPrimitive.length === 0) {
                    this.getLines().then(_.bind(function(data){
                        this.processLines(data, rebuild, this._linesPrimitive);
                        resolve(this._linesPrimitive);
                    }, this)).catch(reject);
                }
                else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },
        //New implementation that uses a single geometry instance instead of many.
        //End-to-end performance improvement, but perhaps responsiveness regression?
        processLines: function(data, rebuild, primitiveContainer) {
            var shw = this.get('_appearance').get('on');
            if (!primitiveContainer) {
                primitiveContainer = new Cesium.PrimitiveCollection();
            }
            if (primitiveContainer !== this._linesPrimitive){
                shw = true;
            }
            if (rebuild) {
                primitiveContainer.removeAll();
            }
            var appearance = this.get('_appearance');
            var colorAttr = Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'))
            );
            var numLengths = data[0].length;
            var lengths = data[0];
            var idxs = new Uint32Array((lengths.reduce(function(total, n){return total + n - 1;})) * 2 - 2);
            var scratchN = new Cesium.Cartesian3(0,0,0);
            var posx = new Float64Array(data[1].length * 3 / 2);
            var lines = data[1];
            for (var k = 0; k < lines.length; k+=2) {
                Cesium.Cartesian3.fromDegrees(lines[k], lines[k+1], 0, Cesium.Ellipsoid.WGS84, scratchN);
                Cesium.Cartesian3.pack(scratchN, posx, (k*3/2));
            }
            var cur_idx = 0;
            var vert_idx = 0;
            for (var i = 0; i < numLengths; i++) {
                var l = lengths[i];
                for (var j = 0; j < l; j++) {
                    if (j !== 0 ){
                        idxs[cur_idx] = vert_idx + j;
                        idxs[cur_idx+1] = vert_idx + j;
                        cur_idx = cur_idx + 2;
                    } else {
                        idxs[cur_idx] = vert_idx;
                        cur_idx++;
                    }
                }
                //idxs[cur_idx] = vert_idx;
                cur_idx--;
                vert_idx = vert_idx + l;
            }
            //var lines = Cesium.Cartesian3.packArray(Cesium.Cartesian3.fromDegreesArray(data[1]))
            var geo = new Cesium.Geometry({
                attributes : {
                    position : new Cesium.GeometryAttribute({
                        componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : posx
                    })
                },
                indices : idxs,
                primitiveType : Cesium.PrimitiveType.LINES,
                boundingSphere : Cesium.BoundingSphere.fromVertices(posx)
            });

            var geoInst = new Cesium.GeometryInstance({
                geometry: geo,
                attributes: {
                    color: colorAttr
                },
            });
            var newPrim = primitiveContainer.add(new Cesium.Primitive({
                geometryInstances: geoInst,
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: true
                }),
                compressVertices: true,
                asynchronous: false,
                id: 'foo',
                allowPicking: false,
                show: shw
            }));
            //var elapsed = performance.now() - start;
            //console.log(elapsed);
            return newPrim;
        },

/*         renderLines: function(batch, rebuild) {
            if (!batch) {
                batch = 3000;
            }
            return new Promise(_.bind(function(resolve, reject) {
                var start = performance.now()
                if(rebuild || this._linesPrimitive.length === 0) {
                    this.getLines().then(_.bind(function(data){
                        if (rebuild) {
                            this._linesPrimitive.removeAll();
                        }
                        var appearance = this.get('_appearance');
                        var colorAttr = Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'))
                        );
                        var numLengths = data[0].length;
                        var lengths = data[0];
                        var lines = data[1];
                        var batch_limit = Math.ceil(numLengths / batch);
                        var segment = 0;
                        var curOffset = 0;
                        for(var b = 0; b < batch_limit; b++){
                            // setup the new batch
                            var geo = [];

                            // build the batch
                            var limit = Math.min(segment + batch, numLengths);
                            for(segment; segment < limit; segment++){
                                geo.push(new Cesium.GeometryInstance({
                                    geometry: new Cesium.SimplePolylineGeometry({
                                        positions: Cesium.Cartesian3.fromDegreesArray(lines.slice(curOffset, curOffset + lengths[segment]*2)),
                                        arcType: Cesium.ArcType.RHUMB,
                                    }),
                                    attributes: {
                                        color: colorAttr
                                    },
                                    allowPicking: false
                                }));
                                curOffset = curOffset + lengths[segment]*2;
                            }

                            // send the batch to the gpu/cesium
                            this._linesPrimitive.add(new Cesium.Primitive({
                                geometryInstances: geo,
                                appearance: new Cesium.PerInstanceColorAppearance({
                                    flat: true,
                                    translucent: true
                                })
                            }));
                        }
                        resolve(this._linesPrimitive);
                        var elapsed = performance.now() - start
                        console.log(elapsed);
                    }, this)).catch(reject);
                } else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        }, */

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(options) {
                var prims = this._linesPrimitive;
                var appearance = this.get('_appearance');
                prims.show = appearance.get('on');
                var changed = appearance.changedAttributes();
                if (changed && (changed.color || changed.alpha)){
                    this.renderLines(3000, true);
                }
            }
        },

    });
    return baseGridObj;
});