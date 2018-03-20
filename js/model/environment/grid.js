define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'moment',
    'localforage',
    'model/appearance',
    'cesium'
], function(_, $, Backbone, BaseModel, moment, localforage, Appearance, Cesium){
    'use strict';
    var baseGridObj = BaseModel.extend({
        urlRoot: '/grid/',
        grid_cache : localforage.createInstance({name: 'Grid Object Data Cache',
                                                    }),
        default_appearance: {
            on: false,
            ctrl_name: 'Grid Appearance',
            color: '#FFC0CB', //PINK
            alpha: 0.3,
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
            this.get('_appearance').fetch().then(_.bind(this.setupVis, this));
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

        getNodes: function(){
            /*
            Gets the nodes of the grid from the server. Until we add subclasses for the different grid types,
            the data received will always be a Nx2 array of points (lon0, lat0, lon1, lat1, ..., lonN, latN)
            */
            return new Promise(_.bind(function(resolve, reject){
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
        },

        getCenters: function(){
            /*
            Gets the centers of the grid from the server. Until we add subclasses for the different grid types,
            the data received will always be a Nx2 array of points (lon0, lat0, lon1, lat1, ..., lonN, latN)
            */
            return new Promise(_.bind(function(resolve, reject){
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
        },

        getLines: function(callback){
            /*
            Gets the lines of the grid from the server. Use the 'num_lengths' header to split the response into
            two ArrayBuffers. The first array is of integer line lengths that sequentially index
            the second array, which are lon/lat pairs that form points of a line. When all such lines are
            drawn, the grid image is complete. Do not override this function; all grids must provide line data
            in this format to be drawn on the Cesium canvas.
            */
            return new Promise(_.bind(function(resolve, reject){
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
        },
        
        renderLines: function(batch, rebuild) {
            if (!batch) {
                batch = 3000;
            }
            return new Promise(_.bind(function(resolve, reject) {
                if(rebuild || this._linesPrimitive.length === 0) {
                    this.getLines().then(_.bind(function(data){
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
                                        followSurface: false,
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
                    }, this)).catch(reject);
                } else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(options) {
                var prims = this._linesPrimitive;
                var appearance = this.get('_appearance');
                prims.show = appearance.get('on');
                var changed = appearance.changedAttributes();
                if (changed && (changed.color || changed.alpha)){
                    this._linesPrimitive.removeAll();
                    this.renderLines(3000, true);
                }
            }
        },

    });
    return baseGridObj;
});