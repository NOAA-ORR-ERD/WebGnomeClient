define([
    'model/movers/base'
], function(BaseMover){
    var gridCurrentMover = BaseMover.extend({
        urlRoot: '/mover/',

        
        defaults: {
            obj_type: 'gnome.movers.current_movers.GridCurrentMover'
        },

        default_appearances: 
        [
            {
                on: false,
                color: 'MEDIUMPURPLE',
                id: 'uv',
                alpha: 1,
                scale: 1,
            },
            {
                on: false,
                color: 'PINK',
                id: 'grid',
                alpha: 0.3,
            }
        ],
        vec_max: 3.0,
        n_vecs: 30,



        initialize: function(options) {
            BaseMover.prototype.initialize.call(this, options);
            if(!this.requested_vectors){
                //this.getVecs(null);
                //this.getMetadata(null);
            }
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this._vectors = new Cesium.BillboardCollection({blendOption: Cesium.BlendOption.TRANSLUCENT});
            this._linesPrimitive = new Cesium.PrimitiveCollection();
            this.get('_appearance').fetch().then(_.bind(this.setupVis, this));
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
            ctx.strokeStyle = 'rgba(204, 0, 204, 1)';
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
                    var appearance = this.get('_appearance').findWhere({id: 'uv'})
                    var addVecsToLayer = _.bind(function(centers) {
                        if(!this._images){
                            this.genVecImages();
                        }
                        var existing_length = this._vectors.length;
                        for(var existing = 0; existing < existing_length; existing++){
                            this._vectors.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing][0], centers[existing][1]);
                            this._vectors.get(existing).show = appearance.get('on');
                            this._vectors.get(existing).color = Cesium.Color[appearance.get('color')];
                        }
                        var create_length = centers.length;

                        for(var c = existing; c < create_length; c++){
                            this._vectors.add({
                                show: appearance.get('on'),
                                position: Cesium.Cartesian3.fromDegrees(centers[c][0], centers[c][1]),
                                image: this._images[0],
                                color: Cesium.Color[appearance.get('color')],
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
            if(options) {
                if(options.id === 'uv') {
                    if (options.changedAttributes()){
                        var bbs = this._vectors._billboards;
                        var appearance = options;
                        if (appearance.changedAttributes()){
                            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});
                            if (appearance.changedAttributes().on == true) {
                                current_outputter.get('current_movers').add(this);
                                current_outputter.save();
                            }
                            if (appearance.changedAttributes().on == false) {
                                current_outputter.get('current_movers').remove(this);
                                current_outputter.save();
                            }
                            for(var i = 0; i < bbs.length; i++) {
                                bbs[i].color = Cesium.Color[appearance.get('color')];
                                bbs[i].alpha = appearance.get('alpha');
                                bbs[i].scale = appearance.get('scale');
                                bbs[i].show = appearance.get('on');
                    }
                }
                    }
                } else if (options.id === 'grid') {
                    var prims = this._linesPrimitive;
                    var appearance = options;
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

                            // send the batch to the gpu/cesium
                            this._linesPrimitive.add(new Cesium.Primitive({
                                geometryInstances: geo,
                                appearance: new Cesium.PerInstanceColorAppearance({
                                    flat: true,
                                    translucent: false
                                })
                            }));
                        }
                        resolve(this._linesPrimitive);
                    }, this));
                } else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },

    });

    return gridCurrentMover;
});