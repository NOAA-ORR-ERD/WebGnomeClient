define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'ol',
    'moment',
    'cesium',
    'localforage',
    'model/appearance',
], function(_, $, Backbone, BaseModel, ol, moment, Cesium, localforage, Appearance){
    'use strict';
    var baseMover = BaseModel.extend({
        urlRoot: '/mover/',
        requesting_grid: false,
        requesting_centers: false,
        requested_grid: false,
        requested_centers: false,
        data_cache : localforage.createInstance({name: 'Environment Object Data Cache',
                                                    }),

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
            localforage.config({
                name: 'WebGNOME Mover Cache',
                storeName: 'data_cache'
            });
            this.on('change', this.resetRequest, this);
            if (!this.isNew()) {
                if(webgnome.hasModel()){
                    this.isTimeValid();
                } else {
                    setTimeout(_.bind(this.isTimeValid,this),2);
                }   
            }
        },

        resetRequest: function(){
            this.requested_grid = false;
            this.requested_centers = false;
        },

        getGrid: function(callback){
            var url = this.urlRoot + this.id + '/grid';
            if(!this.requesting_grid && !this.requested_grid){
                this.requesting_grid = true;
                $.get(url, null, _.bind(function(grid){
                    this.requesting_grid = false;
                    this.requested_grid = true;
                    this.grid = grid;

                    // make it a closed shape if it isn't.
                    for(var cell = 0; cell < this.grid.length; cell++){
                        if(this.grid[cell][0] !== this.grid[cell][this.grid[cell].length - 2] ||
                            this.grid[cell][1] !== this.grid[cell][this.grid[cell].length - 1]){
                            // if the last set of coords are not the same as the first set
                            // copy the first set to the end of the array.
                            this.grid[cell].push(this.grid[cell][0]);
                            this.grid[cell].push(this.grid[cell][1]);
                        }
                    }
                    if(callback){
                        callback(this.grid);
                    }
                    return this.grid;
                }, this));
            } else if(callback) {
                callback(this.grid);
                return this.grid;
            }
        },

        getCenters: function(callback){
            var url = this.urlRoot + this.id + '/centers';
            if(!this.requesting_centers && !this.requested_centers){
                this.requesting_centers = true;
                $.get(url, null, _.bind(function(centers){
                    this.requesting_centers = false;
                    this.requested_centers = true;
                    this.centers = centers;

                    if(callback){
                        callback(this.centers);
                        return this.centers;
                    }
                }, this));
            } else{
                callback(this.centers);
                return this.centers;
            }
        },

        processGrid: function(grid){
            var features = [];
            for(var ar = 0; ar < grid.length; ar++){
                var feature = new ol.Feature();
                var geom = new ol.geom.Polygon([grid[ar]], 'XY')
                    .transform('EPSG:4326', 'EPSG:3857');
                feature.set('geometry', geom, true);
                features.push(feature);
            }
            return features;
        },

        isTimeValid: function() {
            var model_start = webgnome.model.get('start_time');
            var model_stop = webgnome.model.getEndTime();
            var active_start = this.get('active_start');
            var active_stop = this.get('active_stop');
            var real_data_start = this.get('real_data_start');
            var real_data_stop = this.get('real_data_stop');
            var extrapolate = this.get('extrapolate');
            var on = this.get('on');
            this.set('time_compliance', 'valid');
            var msg = '';

            if ((!extrapolate) & (real_data_start !== real_data_stop)) { 
            
                //check for invalid data (model won't run at all)
                if (active_start <= model_start){
                    
                    if (real_data_start > model_start) {
                        msg = 'Mover data begins after model start time';
                        this.set('time_compliance', 'invalid');
                        return msg;
                    }

                    if (real_data_stop <= model_start) {
                        msg = 'Mover contains no data within model run time';
                        this.set('time_compliance', 'invalid');
                        return msg;
                    }
                    
                } else {
                    
                    if (real_data_start > active_start) {
                        msg = 'Mover data begins after mover start time';
                        this.set('time_compliance', 'invalid');
                        return msg;
                    }
                }
                
                //check for semi-valid data (model will run for awhile...)
                
                if (active_stop < model_stop) {
                    if (real_data_stop < active_stop) {
                        msg = 'Mover data ends before mover end time';
                        this.set('time_compliance', 'semivalid');
                        return msg;  
                    }                   
                }
                else {
                    if (real_data_stop < model_stop) {
                        msg = 'Mover data ends before model end time';
                        this.set('time_compliance', 'semivalid');
                        return msg;  
                    }
                }
            }
            return msg;
        },

        interpVecsToTime: function(timestamp, mag_out, dir_out) {
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
                for (n = this.num_vecs;n >= 0; n--) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }
                return;
            } else if ( time_axis[0] >= timestamp) {
                //before or equal to data start so return data start
                u_offset = 0;
                v_offset = this.num_vecs * this.num_times;
                for (n = this.num_vecs;n >= 0;n--) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }
                return;
            }
            for (idx;idx >=0; idx--) {
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
                    for (n = this.num_vecs; n >= 0; n--) {
                        //mag_out has interpolated dx, this._temp has interpolated dy
                        mag_out[n] = data[u0 + n] + (data[u1 + n] - data[u0 + n]) * alpha;
                        this._temp[n] = data[v0 + n] + (data[v1 + n] - data[v0 + n]) * alpha;
                        dir_out[n] = Math.atan2(this._temp[n], mag_out[n]) - pdiv2;
                        mag_out[n] = Math.sqrt(mag_out[n] * mag_out[n] + this._temp[n] * this._temp[n]);
                    }
                    return;
                } else if (time_axis[idx] === timestamp) {
                    for (n = this.num_vecs;n >= 0; n--) {
                        dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                        mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                    }
                    return;
                }
            }
        },
    });

    return baseMover;
});
