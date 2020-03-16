define([
    'underscore',
    'jquery',
    'backbone',
    'moment',
    'cesium',
    'localforage',
    'model/base',
    'model/visualization/mover_appearance'
], function(_, $, Backbone, moment, Cesium, localforage,
            BaseModel, MoverAppearance) {
    'use strict';
    var baseMover = BaseModel.extend({
        urlRoot: '/mover/',

        requesting_grid: false,
        requesting_centers: false,
        requested_grid: false,
        requested_centers: false,

        data_cache : localforage.createInstance({name: 'Mover Object Data Cache',
                                                 }),
        defaults: function() {
            return {
                _appearance: new MoverAppearance()
            };
        },

        model: {
            _appearance: MoverAppearance
        },

        vec_max: 4.0,
        n_vecs: 40,

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);

            localforage.config({
                name: 'WebGNOME Mover Cache',
                storeName: 'data_cache'
            });

            this.on('change', this.resetRequest, this);

            if (!this.isNew()) {
                if (webgnome.hasModel()) {
                    this.isTimeValid();
                }
                else {
                    setTimeout(_.bind(this.isTimeValid,this),2);
                }
            }

            if (this.get('_appearance')) {
                this._vectors = new Cesium.BillboardCollection({
                    blendOption: Cesium.BlendOption.TRANSLUCENT,
                    id: 'uv-'+this.get('id'),
                });

                this._linesPrimitive = new Cesium.PrimitiveCollection();
                this.setupVis();
                this.listenTo(this.get('_appearance'), 'change', this.updateVis);

            }
        },

        resetRequest: function() {
            this.requested_grid = false;
            this.requested_centers = false;
        },

        getBoundingRectangle: function() {
            return new Promise(_.bind(function(resolve, reject) {
                var genRect = _.bind(function(data){
                    this._boundingRectangle = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(data.flat()));
                    resolve(this._boundingRectangle);
                }, this);
                this.getGrid().then(genRect);
            }, this));
        },

        getGrid: function() {
            if (_.isUndefined(this._getGridPromise)) {
                this._getGridPromise = new Promise(_.bind(function(resolve, reject){
                    this.data_cache.getItem(this.id + 'grid').then(_.bind(function(lineData){
                        if(lineData) {
                            console.log(this.get('name') + ' grid found in store');
                            this.requesting = false;
                            this.requested_grid = true;
                            this.grid = lineData;
                            resolve(lineData);
                        } else {
                            if(!this.requesting && !this.requested_grid){
                                var ur = this.urlRoot + this.id + '/grid';
                                this.requesting = true;
                                $.get(ur, null, _.bind(function(grid) {
                                    this.requesting = false;
                                    this.requested_grid = true;
                                    this.grid = grid;
                                    

                                    // make it a closed shape if it isn't.
                                    for (var cell = 0; cell < this.grid.length; cell++) {
                                        if (this.grid[cell][0] !== this.grid[cell][this.grid[cell].length - 2] ||
                                            this.grid[cell][1] !== this.grid[cell][this.grid[cell].length - 1])
                                        {

                                            // if the last set of coords are not the same as
                                            // the first set copy the first set to the end
                                            // of the array.
                                            this.grid[cell].push(this.grid[cell][0]);
                                            this.grid[cell].push(this.grid[cell][1]);
                                        }
                                    }

                                    this.data_cache.setItem(this.id + 'grid', grid);
                                    resolve(this.grid);
                                }, this));
                            } else {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    },this)).catch(reject);
                }, this));
            }
            return this._getGridPromise;
        },

        getCenters: function(callback) {
            var url = this.urlRoot + this.id + '/centers';

            if (!this.requesting_centers && !this.requested_centers) {
                this.requesting_centers = true;

                $.get(url, null, _.bind(function(centers) {
                    this.requesting_centers = false;
                    this.requested_centers = true;
                    this.centers = centers;

                    if (callback) {
                        callback(this.centers);
                        return this.centers;
                    }
                }, this));
            }
            else {
                callback(this.centers);
                return this.centers;
            }
        },

        setupVis: function(attrs) {
            this.genVecImages();
            this._linesPrimitive.show = this.get('_appearance').get('grid_on');
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
                            (0      + len * Math.sin(rad - angle))];
                arr_right =[(center + len * Math.cos(rad + angle)),
                            (0      + len * Math.sin(rad + angle))];

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
                        (0      + len * Math.sin(rad - angle))];
            arr_right =[(center + len * Math.cos(rad + angle)),
                        (0      + len * Math.sin(rad + angle))];

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
            // Generates a Cesium object that can be added to an existing
            // Cesium.Scene in order to produce a representation of this data.
            // Instances of this class hold on to this graphics object, and
            // control updates for it.
            // rebuild currently broken
            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild || this._vectors.length < 100) {
                    var appearance = this.get('_appearance');
                    var addVecsToLayer = _.bind(function(centers) {
                        if (!this._images) {
                            this.genVecImages();
                        }

                        var existing_length = this._vectors.length;
                        for (var existing = 0; existing < existing_length; existing++) {
                            this._vectors.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing][0],
                                                                                                 centers[existing][1]);
                            this._vectors.get(existing).show = appearance.get('vec_on');
                            this._vectors.get(existing).color = Cesium.Color.fromCssColorString(appearance.get('vec_color')).withAlpha(appearance.get('vec_alpha'));
                            this._vectors.get(existing).id = 'vector'+existing;
                            this._vectors.get(existing).image = this._images[this.getImageIdx(0)];
                        }

                        var create_length = centers.length;
                        var bb;

                        for (var c = existing; c < create_length; c++) {
                            bb = this._vectors.add({
                                show: appearance.get('on'),
                                position: Cesium.Cartesian3.fromDegrees(centers[c][0],
                                                                        centers[c][1]),
                                image: this._images[0],
                                color: Cesium.Color.fromCssColorString(appearance.get('vec_color')).withAlpha(appearance.get('vec_alpha'))
                            });
                            bb.id = 'vector'+c;
                        }

                        resolve(this._vectors);
                    }, this);

                    this.getCenters(addVecsToLayer);
                }
                else {
                    resolve(this._vectors);
                }
            }, this));
        },

        getImageIdx: function(data) {
                var gap = this.vec_max / this.n_vecs;
                var mag = Math.abs(data);

                if (mag > 0 && mag < gap / 2) {
                    return 1;
                }
                else if (mag >= this.vec_max) {
                    return this.n_vecs;
                }
                else {
                    return Math.round(mag / gap);
                }
        },

        update: function(step) {
            var appearance = this.get('_appearance');

            if (step.get('CurrentJsonOutput') && appearance.get('vec_on')) {
                var id = this.get('id');
                var data = step.get('CurrentJsonOutput')[id];
                var billboards = this._vectors._billboards;

                if (data) {
                    for (var uv = data.direction.length; uv--;) {
                        billboards[uv].rotation = data.direction[uv];
                        billboards[uv].image = this._images[this.getImageIdx(data.magnitude[uv])];
                        billboards[uv].mag = data.magnitude[uv];
                        billboards[uv].dir = data.direction[uv];
                    }
                }
            }
        },

        updateVis: function(appearance) {
            // Updates the appearance of this model's graphics object.
            // Implementation varies depending on the specific object type
            if (appearance && appearance.changedAttributes()) {
                var changed = appearance.changedAttributes();
                var bbs = this._vectors._billboards;
                var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});

                if (changed.vec_on === true) {
                    current_outputter.get('current_movers').add(this);
                    current_outputter.save();
                }

                if (changed.vec_on === false) {
                    current_outputter.get('current_movers').remove(this);
                    current_outputter.save();
                }

                var newColor;

                for (var i = 0; i < bbs.length; i++) {
                    if (changed.vec_color || changed.vec_alpha) {
                        newColor = Cesium.Color.fromCssColorString(appearance.get('vec_color')).withAlpha(appearance.get('vec_alpha'));
                        bbs[i].color = newColor;
                    }

                    bbs[i].show = appearance.get('vec_on');
                }

                if (!_.isUndefined(changed.grid_color) || 
                        !_.isUndefined(changed.grid_alpha)) {
                    this._linesPrimitive.removeAll();
                    this.renderLines(3000, true);
                }
                else if (!_.isUndefined(changed.grid_on)) {
                    var prims = this._linesPrimitive._primitives;
                    this._linesPrimitive.show = appearance.get('grid_on');

                    for (var k = 0; k < prims.length; k++) {
                        prims[k].show = this._linesPrimitive.show;
                    }
                }
            }
        },

        validate: function(attrs, options) {
            var active_range = attrs.get('active_range');
            
            if (active_range[0] !== "-inf" && active_range[1] !== "inf"){
                if (active_range[0] >= active_range[1]) {
                    return 'Active range invalid: stop must be greater than start';
                }
            }
            // TODO: Consult with Caitlin about the values that need to be
            //       calculated "on the fly" i.e. unscaled val at ref point
        },

        renderLines: function(batch, rebuild) {
            if (!batch) {
                batch = 3000;
            }

            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild || this._linesPrimitive.length === 0) {
                    this.getGrid().then(_.bind(function(data) {
                        this.processLines(data, batch, this._linesPrimitive);
                        // send the batch to the gpu/cesium

                        resolve(this._linesPrimitive);
                    }, this));
                }
                else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },

        processLines: function(data, batch, primitiveContainer) {
            batch = 3000;
            var shw = this.get('_appearance').get('on');
            if (!primitiveContainer) {
                shw = true;
                primitiveContainer = new Cesium.PrimitiveCollection();
            }
            if (primitiveContainer !== this._linesPrimitive) {
                var t = new Cesium.PrimitiveCollection();
                primitiveContainer = primitiveContainer.add(t);
            }

            var appearance = this.get('_appearance');
            var colorAttr = (Cesium.ColorGeometryInstanceAttribute
                             .fromColor(Cesium.Color
                                        .fromCssColorString(appearance.get('grid_color'))
                                        .withAlpha(appearance.get('grid_alpha')))
            );

            var batch_limit = Math.ceil(data.length / batch);
            var segment = 0;

            for (var b = 0; b < batch_limit; b++) {
                // setup the new batch
                var geo = [];

                // build the batch
                var limit = segment + batch;
                for (var cell = segment; cell < limit; cell++) {
                    if (data[cell]) {
                        geo.push(new Cesium.GeometryInstance({
                            geometry: new Cesium.SimplePolylineGeometry({
                                positions: Cesium.Cartesian3.fromDegreesArray(data[cell]),
                                arcType: Cesium.ArcType.RHUMB,
                            }),
                            attributes: {
                                color: colorAttr
                            },
                            allowPicking: false
                        }));
                    }
                }

                segment += batch;

                var newPrim = primitiveContainer.add(new Cesium.Primitive({
                    geometryInstances: geo,
                    appearance: new Cesium.PerInstanceColorAppearance({
                        flat: true,
                        translucent: true
                    }),
                    show: shw
                }));
            }

            return primitiveContainer;
        },

        isTimeValid: function() {
            // Ok, here is what 'valid', 'invalid', and 'semivalid' mean
            // according to Amy.
            //
            //     valid: Within the intersection of the model and the mover's
            //            time range there exists timeseries data sufficient to
            //            perform the mover's calculations.  This can include
            //            extrapolated timeseries data if it is so configured.
            //
            //   invalid: Within the intersection of the model and the mover's
            //            time range there exists one or more sub-ranges where
            //            timeseries data does not exist, and one of these
            //            subranges encompasses the model start time.  Thus,
            //            the model will not even be able to begin processing
            //            steps.
            //
            // semivalid: Within the intersection of the model and the mover's
            //            time range there exists one or more sub-ranges where
            //            timeseries data does not exist, but these subranges
            //            start after the model start time.  Thus, the model
            //            will be able to run for a time before encountering
            //            a failure.
            var msg = '';
            this.set('time_compliance', 'valid');
            this.set('time_compliance_msg',
                     "Mover data covers the entire model duration.");

            var invalidModelTimes = this.invalidModelTimeRanges();

            if (invalidModelTimes.length > 0) {
                // Okay, we have invalid time ranges within our model time
                // But do any of them encompass the model start?
                var [modelStart, modelStop] = webgnome.model.activeTimeRange();

                var crossesModelStart = invalidModelTimes.map(function(item) {
                    return  modelStart >= item[0] && modelStart <= item[1];
                }).reduce(function(prev, elem) {
                    return prev || elem;  // is any element true?
                });

                if (crossesModelStart) {
                    msg = ("Mover data does not include the model's start time. " +
                           "The model will not start.");
                    this.set('time_compliance', 'invalid');
                    this.set('time_compliance_msg', msg);
                }
                else {
                    msg = ("Mover data does not cover the entire model duration. " +
                           "The model will start but eventually fail.");
                    this.set('time_compliance', 'semivalid');
                    this.set('time_compliance_msg', msg);
                }
            }

            return msg;
        },

        invalidModelTimeRanges: function() {
            // List the invalid active time ranges that overlap our Model
            // time range.
            // - Any ranges that overlap will be clipped to the model
            //   time range.
            // - Time range data points are expected to be in ascending order
            //   from left to right.  We don't deal with zero or negative
            //   time ranges.
            if (_.isUndefined(webgnome.model)) {
                return [];
            }

            var [modelStart, modelStop] = webgnome.model.activeTimeRange();

            var suspectRanges = this.invalidActiveTimeRanges();
            var invalidRanges = [];

            // For each range, find its intersection with the model time range.
            suspectRanges.forEach(function(timeRange) {
                if (timeRange[0] >= timeRange[1]) {return;}

                timeRange[0] = _.max([timeRange[0], modelStart]);
                timeRange[1] = _.min([timeRange[1], modelStop]);

                if (timeRange[0] < timeRange[1]) {
                  invalidRanges.push(timeRange);
                }
            }, this);

            return invalidRanges;
        },

        invalidActiveTimeRanges: function() {
            // Return the mover's active time ranges that are not covered
            // by the data in our timeseries.
            // - our timeseries is considered to be a contiguous range of time
            var invalidRanges = [];
            var [activeStart, activeStop] = this.activeTimeRange();
            var [dataStart, dataStop] = this.dataActiveTimeRange();

            if (activeStart < dataStart) {
                invalidRanges.push([activeStart, dataStart]);
            }

            if (activeStop > dataStop) {
                invalidRanges.push([dataStop, activeStop]);
            }

            return invalidRanges;
        },

        activeTimeRange: function() {
            return this.get('active_range').map(function(time) {
                return webgnome.timeStringToSeconds(time);
            });
        },

        dataActiveTimeRange: function(ignore_extrapolation = false) {
            var envObj;

            if (this.attributes.hasOwnProperty('wind') && this.get('wind')) {
                envObj = this.get('wind');
            }
            else if (this.attributes.hasOwnProperty('current') && this.get('current')) {
                envObj = this.get('current');
            }
            else {
                // If we don't have any wind or current data, then we will
                // assume that we are dealing with a non-environment mover
                // that probably has a data_start/stop attribute pair.
                //
                // TODO: FIXME: This is a really brittle way to determine
                //       whether a mover's data matches its active time
                //       range.  Bugs are just waiting to happen.
                return [webgnome.timeStringToSeconds(this.get('data_start')),
                        webgnome.timeStringToSeconds(this.get('data_stop'))];
            }

            var timeRange = envObj.timeseriesTimes();
            var extrapolate = (envObj.attributes.extrapolation_is_allowed &&
                               ignore_extrapolation === false);

            if (extrapolate || timeRange.length === 1) {
                // we are either a constant timeseries object,
                // or extrapolation is set true;
                return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
            }
            else {
                return [_.min(timeRange), _.max(timeRange)];
            }
        },

        extrapolated: function() {
            // We should probably organize the object hierarchy a bit better
            // than this, but for now the base class handles all cases.
            if (this.attributes.hasOwnProperty('wind') && this.get('wind')) {
                return this.get('wind').get('extrapolation_is_allowed');
            }
            else {
                return this.get('extrapolate');
            }
        },

        interpVecsToTime: function(timestamp, mag_out, dir_out) {
            timestamp = webgnome.timeStringToSeconds(timestamp);

            var n = 0;
            var time_axis = this.time_axis,
                idx = time_axis.length - 1,
                rv = {},
                u_offset = idx * this.num_vecs,
                v_offset = u_offset + this.num_times * this.num_vecs,
                pdiv2 = Math.PI / 2,
                data = this.vec_data;

            if (time_axis[idx] <= timestamp) {
                //after or equal to data end so return data end
                for (n = this.num_vecs;n >= 0; n--) {
                    dir_out[n] = Math.atan2(data[v_offset + n], data[u_offset + n]) - pdiv2;
                    mag_out[n] = Math.sqrt(data[u_offset + n] * data[u_offset + n] + data[v_offset + n] * data[v_offset + n]);
                }

                return;
            }
            else if (time_axis[0] >= timestamp) {
                //before or equal to data start so return data start
                u_offset = 0;
                v_offset = this.num_vecs * this.num_times;

                for (n = this.num_vecs;n >= 0; n--) {
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
                        t1 = time_axis[idx + 1],
                        u0 = u_offset,
                        u1 = (idx + 1) * this.num_vecs,
                        v0 = v_offset,
                        v1 = u1 + this.num_times * this.num_vecs;

                    var alpha = (timestamp - t0) / (t1 - t0);

                    for (n = this.num_vecs; n >= 0; n--) {
                        // mag_out has interpolated dx.
                        // this._temp has interpolated dy.
                        mag_out[n] = data[u0 + n] + (data[u1 + n] - data[u0 + n]) * alpha;

                        this._temp[n] = data[v0 + n] + (data[v1 + n] - data[v0 + n]) * alpha;

                        dir_out[n] = Math.atan2(this._temp[n], mag_out[n]) - pdiv2;
                        mag_out[n] = Math.sqrt(mag_out[n] * mag_out[n] + this._temp[n] * this._temp[n]);
                    }

                    return;
                }
                else if (time_axis[idx] === timestamp) {
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
