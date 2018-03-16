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
        default_appearances: 
        [
            {
                on: false,
                ctrl_name: 'Vector Appearance',
                color: 'MEDIUMPURPLE',
                id: 'uv',
                alpha: 1,
                scale: 1,
            },
            {
                on: false,
                ctrl_name: 'Grid Appearance',
                color: 'PINK',
                id: 'grid',
                alpha: 0.3,
            }
        ],
        vec_max: 3.0,
        n_vecs: 30,

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

            this._vectors = new Cesium.BillboardCollection({blendOption: Cesium.BlendOption.TRANSLUCENT});
            this._linesPrimitive = new Cesium.PrimitiveCollection();
            this.get('_appearance').fetch().then(_.bind(function(){
                this.listenTo(this.get('_appearance'), 'change', this.updateVis);
                this.setupVis();
            }, this));
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

        setupVis: function(attrs) {
            this.genVecImages();
            this._linesPrimitive.show = this.get('_appearance').findWhere({id: 'grid'}).get('on');
        },

        genVecImages: function(maxSpeed, numSteps) {
            /* Generates a list of images of various vector lengths. Should be overridden
            on a per-model basis, or not implemented if the data represented is not a vector
            quantity (eg GridTemperature)
            */
            if(!maxSpeed){ maxSpeed = this.vec_max;}
            if(!numSteps){ numSteps = this.n_vecs;}
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
            var angle = Math.PI/5;
            var width = 45;
            var center = width / 2;
            var i = 1;

            for(var a = maxSpeed/numSteps; a < maxSpeed; a += maxSpeed/numSteps){
                var s_a = Math.round(a*10)/10;
                 canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = i * 8 + 8;
                ctx = canvas.getContext('2d');

                var len = Math.abs(canvas.height / Math.log(canvas.height));
                var rad = Math.PI / 2;

                var arr_left = [(center + len * Math.cos(rad - angle)), (0 + len * Math.sin(rad - angle))];
                var arr_right =[(center + len * Math.cos(rad + angle)), (0 + len * Math.sin(rad + angle))];

                ctx.moveTo(center, canvas.height/2);
                ctx.lineTo(center, 0);
                ctx.lineTo(arr_right[0], arr_right[1]);
                ctx.moveTo(arr_left[0], arr_left[1]);
                ctx.lineTo(center, 0);
                ctx.strokeStyle = 'rgba(255,255,255,1)';
                ctx.stroke();

                this._images.push( bbc.add({
                    image: canvas,
                    show: false,
                }).image);
                i++;
            }
        },

        genVectors: function(rebuild) {
            /* Generates a Cesium object that can be added to an existing Cesium.Scene in order
            to produce a representation of this data. Instances of this class hold on to this
            graphics object, and control updates for it*/
            //rebuild currently broken
            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild || this._vectors.length < 100) {
                    var appearance = this.get('_appearance').findWhere({id: 'uv'});
                    var addVecsToLayer = _.bind(function(centers) {
                        if(!this._images){
                            this.genVecImages();
                        }
                        var existing_length = this._vectors.length;
                        for(var existing = 0; existing < existing_length; existing++){
                            this._vectors.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing][0], centers[existing][1]);
                            this._vectors.get(existing).show = appearance.get('on');
                            this._vectors.get(existing).color = Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'));
                        }
                        var create_length = centers.length;

                        for(var c = existing; c < create_length; c++){
                            this._vectors.add({
                                show: appearance.get('on'),
                                position: Cesium.Cartesian3.fromDegrees(centers[c][0], centers[c][1]),
                                image: this._images[0],
                                color: Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha')),
                                scale: appearance.get('scale')
                            });
                        }
                        resolve(this._vectors);
                    }, this);
                    this.getCenters(addVecsToLayer);
                } else {
                    resolve(this._vectors);
                }
            }, this));
        },

        update: function(step) {
            var appearance = this.get('_appearance').findWhere({id: 'uv'});
            if(step.get('CurrentJsonOutput') && appearance.get('on')){
                var id = this.get('id');
                var data = step.get('CurrentJsonOutput')[id];
                var billboards = this._vectors._billboards;
                var gap = this.vec_max/this.n_vecs;
                if(data){
                    for(var uv = data.direction.length; uv--;){
                        billboards[uv].rotation = data.direction[uv];
                        billboards[uv].mag = data.magnitude[uv];
                        billboards[uv].image = this._images[Math.round(Math.abs(data.magnitude[uv])/gap)];
                        billboards[uv].mag = data.magnitude[uv];
                        billboards[uv].dir = data.direction[uv];
                    }
                }
            }
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            var appearance;
            if(options) {
                if(options.id === 'uv') {
                    if (options.changedAttributes()){
                        var bbs = this._vectors._billboards;
                        appearance = options;
                        if (appearance.changedAttributes()){
                            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});
                            if (appearance.changedAttributes().on === true) {
                                current_outputter.get('current_movers').add(this);
                                current_outputter.save();
                            }
                            if (appearance.changedAttributes().on === false) {
                                current_outputter.get('current_movers').remove(this);
                                current_outputter.save();
                            }
                            var changedAttrs, newColor;
                            changedAttrs = appearance.changedAttributes()
                            for(var i = 0; i < bbs.length; i++) {
                                if(changedAttrs.color || changedAttrs.alpha) {
                                    newColor = Cesium.Color.fromCssColorString(appearance.get('color')).withAlpha(appearance.get('alpha'));
                                    bbs[i].color = newColor;
                                }
                                bbs[i].scale = appearance.get('scale');
                                bbs[i].show = appearance.get('on');
                            }
                        }
                    }
                } else if (options.id === 'grid') {
                    var prims = this._linesPrimitive;
                    appearance = options;
                    prims.show = appearance.get('on');
                    var changed = appearance.changedAttributes();
                    if (changed && changed.color){
                        this._linesPrimitive.removeAll();
                        this.renderLines(3000, true);
                    }
                }
            }
        },

        validate: function(attrs, options){
            //TODO: Consult with Caitlin about the values that need to be calculated "on the fly" i.e. unscaled val at ref point
        },

        renderLines: function(batch, rebuild) {
            if (!batch) {
                batch = 3000;
            }

            return new Promise(_.bind(function(resolve, reject) {
                if(rebuild || this._linesPrimitive.length === 0) {
                    this.getGrid(_.bind(function(data){
                            this.processLines(data, batch, this._linesPrimitive);
                            // send the batch to the gpu/cesium
                            
                        resolve(this._linesPrimitive);
                    }, this));
                } else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },

        processLines: function(data, batch, primitiveContainer){
            if(!primitiveContainer){
                primitiveContainer = new Cesium.PrimitiveCollection();
            }
            var appearance = this.get('_appearance').findWhere({id:'grid'});
            var colorAttr = Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color[appearance.get('color')].withAlpha(appearance.get('alpha'))
            );

            var batch_limit = Math.ceil(data.length / batch);
            var segment = 0;
            for(var b = 0; b < batch_limit; b++){
                // setup the new batch
                var geo = [];

                // build the batch
                var limit = segment + batch;
                for(var cell = segment; cell < limit; cell++){
                    if(data[cell]){
                        geo.push(new Cesium.GeometryInstance({
                            geometry: new Cesium.SimplePolylineGeometry({
                                positions: Cesium.Cartesian3.fromDegreesArray(data[cell]),
                                followSurface: false,
                            }),
                            attributes: {
                                color: colorAttr
                            },
                            allowPicking: false
                        }));
                    }
                }

                segment += batch;

                primitiveContainer.add(new Cesium.Primitive({
                    geometryInstances: geo,
                    appearance: new Cesium.PerInstanceColorAppearance({
                        flat: true,
                        translucent: false
                    })
                }));
            }
            return primitiveContainer;
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
