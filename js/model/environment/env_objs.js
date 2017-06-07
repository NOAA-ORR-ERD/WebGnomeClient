define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'moment',
    'localforage',
], function(_, $, Backbone, BaseModel, moment, localforage){
    'use strict';
    var gridCurrentModel = BaseModel.extend({
        env_obj_cache : localforage.createInstance({name: 'Environment Object Data Cache',
                                                    }),
        urlRoot: '/environment/',
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        
        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
            if(!this.requested_vectors){
                var vecs = this.getVecs(null);
            }
            this.on('change', this.resetRequest, this);
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
            this.held_by = []
        },

        resetRequest: function(){
            this.requested = false;
        },

        getNodes: function(callback){
            var ur = this.urlRoot + this.id + '/nodes';
            if(!this.requesting && !this.requested_nodes){
                this.env_obj_cache.getItem(this.id + 'nodes').then(_.bind(function(value){
                    if(value) {
                        console.log(this.id + ' nodes found in store');
                        this.requested_nodes = true;
                        this.nodes = value;
                        if (callback) {
                            callback(this.nodes);
                        }
                        return this.nodes;
                    }
                },this)).catch(function(err) {
                    console.log(err);
                });
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
                        success: _.bind(function(nodes, sts, response){
                    this.requesting = false;
                    this.requested_nodes = true;
                    var dtype = Float32Array;
                    var dtl = dtype.BYTES_PER_ELEMENT
                    var num_nodes = nodes.byteLength / (2*dtl);
                    this.nodes = new dtype(nodes)
                    this.env_obj_cache.setItem(this.id + 'nodes', this.nodes, )
                    return this.nodes;
                }, this )});
            } else if(callback) {
                callback(this.nodes);
                return this.nodes;
            }
        },

        getGrid: function(callback){
            var ur = this.urlRoot + this.id + '/grid';
            if(!this.requesting && !this.requested_grid){
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
                        success: _.bind(function(grid){
                    this.requesting = false;
                    this.requested_grid = true;
                    var dtype = Float32Array;
                    var dtl = dtype.BYTES_PER_ELEMENT
                    var grid_type = this.get('grid').obj_type;
                    var num_sides = 0;
                    if (grid_type[grid_type.length - 1] === 'U') {
                        num_sides = 3;
                    } else {
                        num_sides = 4;
                    }
                    var num_cells = grid.byteLength / (num_sides * 2 * dtl);
                    var line_coord_len = num_sides * 2 + 2; // lon, lat per vertex, plus one extra to complete shape

                    var buflen = num_cells * line_coord_len * dtl;
                    var buffer = new ArrayBuffer(buflen);
                    this.grid = new dtype(buffer);

                    // make it a closed shape if it isn't.
                    var og = new dtype(grid);
                    for(var cell = 0; cell < num_cells; cell++){
                        var cell_offset = cell*(line_coord_len);
                        var og_off = cell*(num_sides*2)
                        this.grid.set(og.slice(og_off, og_off+(num_sides*2)), cell_offset);
                        this.grid.set(og.slice(og_off, og_off+2), cell_offset+(num_sides*2));
                    }

                    if(callback){
                        callback(this.grid);
                    }
                    return this.grid;
                }, this )});
            } else if(callback) {
                callback(this.grid);
                return this.grid;
            }
        },

        getVecs: function(callback){
            var ur = this.urlRoot + this.id + '/vectors';
            if(!this.requesting && !this.requested_vectors){
                this.env_obj_cache.getItem(this.id + 'vectors').then(_.bind(function(value){
                    if(value) {
                        console.log(this.id + ' vectors found in store');
                        var dtype = Float32Array;
                        var dtl = dtype.BYTES_PER_ELEMENT
                        this.requested_vectors = true;
                        this.vec_data = value[0];
                        var shape = value[1]
                        this.num_times = parseInt(shape[1]);
                        this.num_vecs = parseInt(shape[2]);
                        this.time_axis = []
                        for (var i=0; i < this.get('time').data.length; i++) {
                            var t = this.get('time').data[i]
                            this.time_axis.push(moment(t.replace('T',' ')).unix())
                        }
                        this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        if (callback) {
                            callback(this.vec_data);
                        }
                        return this.vec_data;
                    }
                },this)).catch(function(err) {
                    console.log(err);
                });
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
                        success: _.bind(function(uv_data, sts, response){
                    this.requesting = false;
                    this.requested_vectors = true;
                    var dtype = Float32Array;
                    var dtl = dtype.BYTES_PER_ELEMENT
                    var shape = response.getResponseHeader('shape').replace(/[L()]/g, '').split(',');
                    var num_times = parseInt(shape[1]);
                    var num_vecs = parseInt(shape[2]);

                    var datalen = num_times * num_vecs * dtl
                    this.vec_data = new Float32Array(uv_data)
                    this.env_obj_cache.setItem(this.id + 'vectors', [this.vec_data, shape], )
                    
                    this.num_times = num_times
                    this.num_vecs = num_vecs
                    this.time_axis = []
                    for (var i=0; i < this.get('time').data.length; i++) {
                        var t = this.get('time').data[i]
                        this.time_axis.push(moment(t.replace('T',' ')).unix())
                    }
                    this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                    this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                    this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));

                }, this )});
            } else if(callback) {
                callback(this.vec_data);
                return this.vec_data;
            }
        },

        interpVecsToTime: function(timestamp, mag_out, dir_out) {
            // returns interpolated direction and magnitude in time
            timestamp = moment(timestamp.replace('T',' ')).unix()
            var time_axis = this.time_axis,
                idx = time_axis.length - 1,
                rv = {},
                u_offset = idx * this.num_vecs,
                v_offset = u_offset + this.num_times * this.num_vecs,
                pdiv2 = Math.PI/2,
                data = this.vec_data;
            if(time_axis[idx] <= timestamp) {
                //after or equal to data end so return data end
                for (var n = this.num_vecs;n--;) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }
                return;
            } else if ( time_axis[0] >= timestamp) {
                //before or equal to data start so return data start
                u_offset = 0;
                v_offset = this.num_vecs * this.num_times;
                for (var n = this.num_vecs;n--;) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }
                return;
            }
            for (;idx--;) {
                u_offset = idx * this.num_vecs;
                v_offset = u_offset + this.num_times * this.num_vecs;
                if (time_axis[idx] < timestamp) {
                    var t0 = time_axis[idx],
                        t1 = time_axis[idx+1],
                        u0 = u_offset,
                        u1 = (idx+1) * this.num_vecs,
                        v0 = v_offset,
                        v1 = u1 + this.num_times * this.num_vecs,
                        data = this.vec_data;
                    var alpha = (timestamp - t0) / (t1 - t0)
                    for (var n = this.num_vecs;n--;) {
                        //mag_out has interpolated dx, this._temp has interpolated dy
                        mag_out[n] = data[u0 + n] + (data[u1 + n] - data[u0 + n]) * alpha;
                        this._temp[n] = data[v0 + n] + (data[v1 + n] - data[v0 + n]) * alpha;
                        dir_out[n] = Math.atan2(this._temp[n], mag_out[n]) - pdiv2;
                        mag_out[n] = Math.sqrt(mag_out[n] * mag_out[n] + this._temp[n] * this._temp[n]);
                    }
                    return;
                } else if (time_axis[idx] === timestamp) {
                    for (var n = this.num_vecs;n--;) {
                        dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                        mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                    }
                    return;
                }
            }
//(timestamp - t0) / (t1 - t0)
        },
    });

    return gridCurrentModel;
});