define([
    'underscore',
    'jquery',
    'backbone',
    'cesium',
    'model/environment/env_objs',
    'model/environment/grid',
    'moment',
    'localforage',
    'model/visualization/vector_appearance',
    'socketio'
], function(_, $, Backbone, Cesium, EnvBaseModel, BaseGridObj, moment, localforage, VectorAppearance, io){
    'use strict';
    var gridEnvObj = EnvBaseModel.extend({
        socketRoute: '/data_socket',
        model: {
            time: Backbone.Model,
            grid: BaseGridObj,
            variables: Backbone.Collection,
            _appearance: VectorAppearance
        },
        defaults: function() {
            return {
                _appearance: new VectorAppearance()
            };
        },

        initialize: function(attrs, options) {
            EnvBaseModel.prototype.initialize.call(this, attrs, options);

            this.on('change', this.resetRequest, this);

            if (!this.requested_vectors) {
                this.getMetadata(null);
            }

            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this._vectors = new Cesium.BillboardCollection({blendOption: Cesium.BlendOption.TRANSLUCENT});
            this.setupVis();
            //this.socketConnect();

        },

        setupVis: function(attrs) {
            this.genVecImages();
        },

        resetRequest: function() {
            this.requested = false;
        },

        getMetadata: function() {
            var url = this.urlRoot + this.id + '/metadata';

            $.get(url, null, _.bind(function(metadata) {
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

        timeseriesTimes: function() {
            var timeData = this.get('time').data;
            if (_.isUndefined(timeData)) {
                // We must be dealing with a
                // Backbone.Model type.  This seems to
                // change with context depending on
                // who is creating the GriddedWind mover.
                timeData = this.get('time').get('data');
            }

            return timeData.map(function(dateVal) {
                return webgnome.timeStringToSeconds(dateVal);
            }, this);
        },

        getVecs: function() {
            if (_.isUndefined(this._getVecsPromise)) {
                this._getVecsPromise = new Promise(_.bind(function(resolve, reject) {
                    this.env_obj_cache.getItem(this.id + 'vectors').then(_.bind(function(value){
                        if (value) {
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

                            var timeData = this.get('time').data;
                            if (_.isUndefined(timeData)) {
                                // We must be dealing with a
                                // Backbone.Model type.  This seems to
                                // change with context depending on
                                // who is creating the GriddedWind mover.
                                timeData = this.get('time').get('data');
                            }

                            for (var i = 0; i < timeData.length; i++) {
                                var t = timeData[i];
                                this.time_axis.push(webgnome.timeStringToSeconds(t));
                            }

                            this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                            this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                            this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));

                            resolve(this.vec_data);
                        }
                        else {
                            if (!this.requesting && !this.requested_vectors) {
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
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    success: _.bind(function(uv_data, sts, response) {
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

                                        var timeData = this.get('time').data;
                                        if (_.isUndefined(timeData)) {
                                            // We must be dealing with a
                                            // Backbone.Model type.  This seems to
                                            // change with context depending on
                                            // who is creating the GriddedWind mover.
                                            timeData = this.get('time').get('data');
                                        }

                                        for (var i = 0; i < timeData.length; i++) {
                                            var t = timeData[i];
                                            this.time_axis.push(webgnome.timeStringToSeconds(t));
                                        }

                                        this.mag_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                                        this.dir_data = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));
                                        this._temp = new Float32Array(new ArrayBuffer(this.num_vecs * dtl));

                                    },this),

                                    error: function(jqXHR, sts, err){reject(err);},
                                });
                            }
                            else {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    }, this)).catch(reject);
                }, this));
            }
            return this._getVecsPromise;
        },

        genVecImages: function(maxSpeed, numSteps) {
            // Generates a list of images of various vector lengths.
            // Should be overridden on a per-model basis, or not implemented
            // if the data represented is not a vector quantity
            // (eg GridTemperature)
            if (!maxSpeed) {maxSpeed = this.vec_max;}
            if (!numSteps) {numSteps = this.n_vecs;}
            // v == 0
            var bbc = this._vectors;
            this._images = [];
            var canvas = document.createElement('canvas');

            canvas.width = 7;
            canvas.height = 7;

            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(1, 1, 0.5, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(255,255,255,1)';
            ctx.stroke();

            this._images[0] = bbc.add({
                image: canvas,
                show: false,
                id: 0,
            }).image;

            var angle = Math.PI / 5;
            var width = 45;
            var center = width / 2;
            var i = 1;

            // 0 < v < v_max
            var speedStep = maxSpeed / numSteps;
            var len, rad, arr_left, arr_right;
            for (var a = speedStep; a < maxSpeed; a += speedStep) {
                var s_a = Math.round(a * 10) / 10;

                canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = i * 8 + 8;

                ctx = canvas.getContext('2d');

                len = Math.abs(canvas.height / Math.log(canvas.height));
                rad = Math.PI / 2;

                arr_left = [(center + len * Math.cos(rad - angle)),
                                (0 + len * Math.sin(rad - angle))];
                arr_right =[(center + len * Math.cos(rad + angle)),
                                (0 + len * Math.sin(rad + angle))];

                ctx.moveTo(center, canvas.height / 2);
                ctx.lineTo(center, 0);
                ctx.lineTo(arr_right[0], arr_right[1]);

                ctx.moveTo(arr_left[0], arr_left[1]);
                ctx.lineTo(center, 0);

                ctx.strokeStyle = 'rgba(255,255,255,1)';
                ctx.stroke();

                this._images.push(bbc.add({
                    image: canvas,
                    show: false,
                }).image);

                i++;
            }
            // v >= v_max
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = i * 8 + 8;
            ctx = canvas.getContext('2d');
            len = Math.abs(canvas.height / Math.log(canvas.height));
            rad = Math.PI / 2;

            arr_left = [(center + len * Math.cos(rad - angle)),
                            (0 + len * Math.sin(rad - angle))];
            arr_right =[(center + len * Math.cos(rad + angle)),
                            (0 + len * Math.sin(rad + angle))];

            ctx.moveTo(center, canvas.height / 2);
            ctx.lineTo(center, 0);
            ctx.lineTo(arr_right[0], arr_right[1]);

            ctx.moveTo(arr_left[0], arr_left[1]);
            ctx.lineTo(center, 0);

            arr_left[1] = arr_left[1] + canvas.height/20;
            arr_right[1] = arr_right[1] + canvas.height/20;
            ctx.moveTo(center,canvas.height/20);
            ctx.lineTo(arr_left[0], arr_left[1]);
            ctx.moveTo(center,canvas.height/20);
            ctx.lineTo(arr_right[0], arr_right[1]);

            ctx.strokeStyle = 'rgba(255,255,255,1)';
            ctx.stroke();

            this._images.push(bbc.add({
                image: canvas,
                show: false,
            }).image);
            
        },

        genVectors: function(rebuild) {
            /* Generates a Cesium object that can be added to an existing Cesium.Scene in order
            to produce a representation of this data. Instances of this class hold on to this
            graphics object, and control updates for it*/
            //rebuild currently broken
            if (_.isUndefined(this._genVectorsPromise)) {
                this._genVectorsPromise = new Promise(_.bind(function(resolve, reject) {
                    if (rebuild || this._vectors.length < 100) {
                        var addVecsToLayer = _.bind(function(centers) {
                            if (!this._images) {
                                this.genVecImages();
                            }

                            var existing_length = this._vectors.length;
                            var appearance = this.get('_appearance');

                            for (var existing = 0; existing < existing_length; existing++) {
                                this._vectors.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing*2], centers[existing*2+1]);
                                this._vectors.get(existing).show = true;
                                this._vectors.get(existing).color = Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'));
                                this._vectors.get(existing).id = 'vector'+existing;
                                this._vectors.get(existing).image = this._images[this.getImageIdx(0)];
                            }

                            var create_length = centers.length / 2;
                            var bb;
                            for (var c = existing; c < create_length; c++) {
                                bb = this._vectors.add({
                                    show: true,
                                    position: Cesium.Cartesian3.fromDegrees(centers[c * 2], centers[c * 2 + 1]),
                                    image: this._images[0],
                                    color: Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha')),
                                    scale: this.get('_appearance').get('scale')
                                });
                                bb.id = 'vector'+c;
                            }
                            resolve(this._vectors);
                            this._genVectorsPromise = undefined;
                        }, this);

                        if ('nodes'.includes(this.data_location)) {
                            this.get('grid').getNodes()
                                .then(addVecsToLayer)
                                .catch(function(err) {
                                    console.log(err);
                                    reject(err);
                                });
                        }
                        else {
                            this.get('grid').getCenters()
                                .then(addVecsToLayer)
                                .catch(function(err) {
                                    console.log(err);
                                    reject(err);
                                });
                        }
                    }
                    else {
                        resolve(this._vectors);
                        this._genVectorsPromise = undefined;
                    }
                }, this));
            }
            return this._genVectorsPromise;
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if (options) {
                var bbs = this._vectors._billboards;
                var appearance = this.get('_appearance');
                var changedAttrs, newColor;

                changedAttrs = appearance.changedAttributes();

                if (changedAttrs) {
                    for (var i = 0; i < bbs.length; i++) {
                        if (changedAttrs.color || changedAttrs.alpha) {
                            newColor = Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'));
                            bbs[i].color = newColor;
                        }

                        bbs[i].show = appearance.get('on');
                    }
                }
            }
        },

        getImageIdx: function(data) {
                var gap = this.vec_max / this.n_vecs;
                var mag = Math.abs(data);
                if (mag > 0 && mag < gap/2) {
                    return 1;
                } else if (mag >= this.vec_max) {
                    return this.n_vecs -1;
                } else {
                    return Math.round(mag / gap);
                }
            
        },

        update: function(step) {
            // returns interpolated direction and magnitude in time
            if (this.get('_appearance') &&
                    this.get('_appearance').get('on') &&
                    this._vectors.length > 0) {
                var timestamp = step.get('SpillJsonOutput').time_stamp;
                var mag_data = this.mag_data;
                var dir_data = this.dir_data;

                this.interpVecsToTime(timestamp, mag_data, dir_data);

                var billboards = this._vectors._billboards;

                for (var uv = mag_data.length; uv--;) {
                    //billboards[uv].show = true;
                    billboards[uv].rotation = dir_data[uv];
                    billboards[uv].image = this._images[this.getImageIdx(mag_data[uv])];
                    billboards[uv].mag = mag_data[uv];
                    billboards[uv].dir = dir_data[uv];
                }
            }
        },

        uvImageIdx: function(mag) {
            return Math.round(Math.abs(mag)*10)/10;
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

            if (time_axis[idx] <= timestamp) {
                //after or equal to data end so return data end
                for (n = this.num_vecs; n >= 0; n--) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }

                return;
            }
            else if ( time_axis[0] >= timestamp) {
                //before or equal to data start so return data start
                u_offset = 0;
                v_offset = this.num_vecs * this.num_times;

                for (n = this.num_vecs; n >= 0; n--) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }

                return;
            }

            for (idx; idx >= 0; idx--) {
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
                }
                else if (time_axis[idx] === timestamp) {
                    for (n = this.num_vecs; n >= 0; n--) {
                        dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                        mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                    }

                    return;
                }
            }
        },

        //SOCKET & DATA MANAGEMENT STUFF BELOW HERE

        socketConnect: function(){
            console.log('Connecting to data namespace');
            if(!this.socket){
                this.socket = io.connect(webgnome.config.api + this.socketRoute);
                this.socket.on('metadata', _.bind(this.metadataHandler, this));
                this.socket.on('data', _.bind(this.dataHandler,this));
                this.socket.on('serial', _.bind(this.serialHandler, this));
            }
        },

        metadataHandler: function(id, md) {
            if (id !== this.get('id')) {
                return;
            }
            console.log('Received metadata for: ' + this.get('id'));
            if (_.isUndefined(this.metadata)){
                this.metadata = md;
                this.setupDataPromises(true);
            } else {
                console.error('metadata should only be requested once per object instance');
            }
        },

        setupDataPromises: function(rebuild) {
            if (rebuild && !_.isNull(this.metadata)) {
                var md = this.metadata;
                if (md.time_arr) {
                    this._time_arr = md.time;
                }
                //this._data is ALWAYS the primary data represented by this gridded environment object
                //for a current or wind, for example, this would be the vector data
                this._data = [];
                for(var k=0; k < this._time_arr.length; k++) {
                    this._data.append(this._genDataPromise(k));
                }
            }
        },

        _genDataPromise(index) {
            return new Promise(_.bind(function(resolve, reject){
                this.listenToOnce(this, 'data_'+index, _.bind(function(idx){
                    this.stopListening(this, 'datafail_'+idx);
                    resolve(this.env_obj_cache.getItem('data_'+idx));
                },this));
                this.listenToOnce(this, 'datafail_'+index, _.bind(function(idx){
                    this.stopListening(this, 'data_'+idx);
                    reject();
                },this));
            }, this));
        },

        dataHandler: function(id, data) {
            if (id !== this.get('id')) {
                return;
            }
            console.log('Received data for: ' + this.get('id'));
        },

        serialHandler: function(id, serial) {
            if (id !== this.get('id')) {
                return;
            }
            console.log('Received serial for: ' + this.get('id'));
        },

        socketGet(command, args) {
            this[command].apply(this, args);
        },

        get_metadata: function() {
            /*
            Returns metadata about the object on the server. In particular, it should provide
            full usage information for get_data.
            */
            this.socket.emit('get_metadata', this.get('id'));
        },

        get_attribute: function(attr_name) {
            /*
            Use this function to retrieve a generic attribute of this object from the server.
            Returns a promise that resolves when the attribute gets cached on the client.

            Returns null if the attribute is None. Returns undefined if the attribute does not exist
            */
            this.socket.emit('get_attribute', this.get('id'), attr_name);
        },

        get_data: function(data_name, slices, cast_type, precision) {
            /*
            Use this function when requesting arrays of data that may be sliced. Unlike
            get_attribute, this function only accepts certain data_names depending on what
            the object on the server can handle.

            Returns a promise that resolves when the data requested gets cached on the client
            */
            this.socket.emit('get_data', this.get('id'), data_name);
            
        },

        get_serial: function() {
            this.socket.emit('get_serial', this.get('id'));
        },

    });

    return gridEnvObj;
});
