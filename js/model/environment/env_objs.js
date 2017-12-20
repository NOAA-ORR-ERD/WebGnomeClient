define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'moment',
    'localforage',
], function(_, $, Backbone, BaseModel, moment, localforage){
    'use strict';
    var baseEnvObj = BaseModel.extend({
        urlRoot: '/environment/',
        env_obj_cache : localforage.createInstance({name: 'Environment Object Data Cache',
                                                    }),

        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
            this.on('change', this.resetRequest, this);
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
            this.appearance = new Backbone.Model();
        },

        resetRequest: function(){
            this.requested = false;
        },

        getMetadata: function() {
            var url = this.urlRoot + this.id + '/metadata';
            $.get(url, null, _.bind(function(metadata){
                this.data_location = metadata.data_location;
/*
                this.data_shape = metadata['data_shape'];
                this.grid_shape = metadata['grid_shape'];
                this.ntimes = metadata['ntimes']
                this.nodes_shape = metadata['nodes_shape']
                this.centers_shape = metadata['centers_shape']
*/
            }, this ));
        },

        getVecs: function(){
            return new Promise((resolve, reject) => {
                this.env_obj_cache.getItem(this.id + 'vectors').then((value) => {
                    if(value) {
                        console.log(this.id + ' vectors found in store');
                        var dtype = Float32Array;
                        var dtl = dtype.BYTES_PER_ELEMENT;
                        this.requesting = false;
                        this.requested_vectors = true;
                        this.vec_data = value[0];
                        var shape = value[1];
                        this.num_times = parseInt(shape[1]);
                        this.num_vecs = parseInt(shape[2]);
                        this.time_axis = [];
                        for (var i=0; i < this.get('time').get('data').length; i++) {
                            var t = this.get('time').get('data')[i];
                            this.time_axis.push(moment(t.replace('T',' ')).unix());
                        }
                        this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                        resolve(this.vec_data);
                    } else {
                        if(!this.requesting && !this.requested_vectors){
                            this.requesting = true;
                            var ur = this.urlRoot + this.id + '/vectors';
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
                                success: (uv_data, sts, response) => {
                                    this.requesting = false;
                                    this.requested_vectors = true;
                                    var dtype = Float32Array;
                                    var dtl = dtype.BYTES_PER_ELEMENT;
                                    var shape = response.getResponseHeader('shape').replace(/[L()]/g, '').split(',');
                                    var num_times = parseInt(shape[1]);
                                    var num_vecs = parseInt(shape[2]);

                                    var datalen = num_times * num_vecs * dtl;
                                    this.vec_data = new Float32Array(uv_data);
                                    this.env_obj_cache.setItem(this.id + 'vectors', [this.vec_data, shape]);
                                    
                                    this.num_times = num_times;
                                    this.num_vecs = num_vecs;
                                    this.time_axis = [];
                                    for (var i=0; i < this.get('time').get('data').length; i++) {
                                        var t = this.get('time').get('data')[i];
                                        this.time_axis.push(moment(t.replace('T',' ')).unix());
                                    }
                                    this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                                    this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                                    this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));

                                },
                                error: (jqXHR, sts, err) => reject(err),
                            });
                        } else {
                            reject(new Error('Request already in progress'));
                        }
                    }
                }).catch((err) => reject(err));
            });
        },

        interpVecsToTime: function(timestamp, mag_out, dir_out) {
            // returns interpolated direction and magnitude in time
            timestamp = moment(timestamp.replace('T',' ')).unix();
            var n = 0;
            var time_axis = this.time_axis,
                idx = time_axis.length - 1,
                rv = {},
                u_offset = idx * this.num_vecs,
                v_offset = u_offset + this.num_times * this.num_vecs,
                pdiv2 = Math.PI/2,
                data = this.vec_data;
            if(time_axis[idx] <= timestamp) {
                //after or equal to data end so return data end
                for (n = this.num_vecs;n--;) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }
                return;
            } else if ( time_axis[0] >= timestamp) {
                //before or equal to data start so return data start
                u_offset = 0;
                v_offset = this.num_vecs * this.num_times;
                for (n = this.num_vecs;n--;) {
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
                        v1 = u1 + this.num_times * this.num_vecs;
                    var alpha = (timestamp - t0) / (t1 - t0);
                    for (n = this.num_vecs;n--;) {
                        //mag_out has interpolated dx, this._temp has interpolated dy
                        mag_out[n] = data[u0 + n] + (data[u1 + n] - data[u0 + n]) * alpha;
                        this._temp[n] = data[v0 + n] + (data[v1 + n] - data[v0 + n]) * alpha;
                        dir_out[n] = Math.atan2(this._temp[n], mag_out[n]) - pdiv2;
                        mag_out[n] = Math.sqrt(mag_out[n] * mag_out[n] + this._temp[n] * this._temp[n]);
                    }
                    return;
                } else if (time_axis[idx] === timestamp) {
                    for (n = this.num_vecs;n--;) {
                        dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                        mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                    }
                    return;
                }
            }
        },
        
        genVecImages: function() {
            /* Generates a list of images of various vector lengths. Should be overridden
            on a per-model basis, or not implemented if the data represented is not a vector
            quantity (eg GridTemperature)
            */
            throw {name : "NotImplementedError", message : "genVecImages is not implemented for the environment objects base class"}; 
        },

        genVectors: function() {
            /* Generates a Cesium object that can be added to an existing Cesium.Scene in order
            to produce a representation of this data. Instances of this class hold on to this
            graphics object, and control updates for it*/
            throw {name : "NotImplementedError", message : "genVectors is not implemented for the environment objects base class"}; 
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            throw {name : "NotImplementedError", message : "updateVis is not implemented for the environment objects base class"};
        },
    });

    return baseEnvObj;
});