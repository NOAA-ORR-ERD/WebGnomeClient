define([
    'model/environment/env_objs',
    'model/environment/grid',
    'backbone',
    'cesium',
], function(BaseEnvObj, BaseGridObj, BackBone, Cesium){
    'use strict';
    var gridCurrentModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        model: {time: BackBone.Model,
                grid: BaseGridObj,
                variables: BackBone.Model},
        
        initialize: function(attrs, options) {
            BaseEnvObj.prototype.initialize.call(this, attrs, options);
            if(!this.requested_vectors){
                this.getVecs(null);
                this.getMetadata(null);
            }
            this.appearance.set({
                on: true,
                color: 'MEDIUMPURPLE',
                alpha: 1,
                scale: 3,
                });
            this.listenTo(this.appearance, 'change', this.updateAppearance);
            this.genVecImages();
            this._vectors = new Cesium.BillboardCollection({blendOption: Cesium.BlendOption.TRANSLUCENT});
            
        },
        genVecImages: function() {
            /* Generates a list of images of various vector lengths. Should be overridden
            on a per-model basis, or not implemented if the data represented is not a vector
            quantity (eg GridTemperature)
            */
            var bbc = new Cesium.BillboardCollection();
            this._images = []
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

            for(var a = 0.1; a < 3.0; a += 0.1){
                var s_a = Math.round(a*10)/10;
                 canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = s_a * 80 + 8;
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

                this._images.push(bbc.add({
                    image: canvas,
                    show: false,
                }).image);
            }
        },

        genVectors: function() {
            /* Generates a Cesium object that can be added to an existing Cesium.Scene in order
            to produce a representation of this data. Instances of this class hold on to this
            graphics object, and control updates for it*/
            //if(options && options['timestamp']) {}
            return new Promise(_.bind(function(resolve, reject) {
                var addVecsToLayer = _.bind(function(centers) {
                    this._vectors.removeAll()
                    if(!this._images){
                        this.generateVecImages();
                    }
                    var create_length = centers.length / 2;

                    for(var c = 0; c < create_length; c++){
                        _off = c*2;
                        this._vectors.add({
                            show: true,
                            position: Cesium.Cartesian3.fromDegrees(centers[_off], centers[_off+1]),
                            image: this.current_arrow[id][0],
                            color: Cesium.Color[this.appearance.get('color')],
                            scale: this.appearance.get('scale')
                        });
                    }
                    resolve(this._vectors);
                }, this);
                if ('nodes'.includes(this.data_location)) {
                    this.get('grid').getNodes()
                        .then(addVecsToLayer)
                        .catch(function(err) {
                            console.log(err);
                            reject(err);
                            });
                } else {
                    this.get('grid').getCenters()
                        .then(addVecsToLayer)
                        .catch(function(err) {
                            console.log(err);
                            reject(err);
                        });
                }
            }, this));
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            this.appearance.set(options)
            var bbs = this._vectors._billboards
            for(var i = 0; i < bbs.length; i++) {
                bbs[i].color = Cesium.Color[self.appearance.get('color')];
                bbs[i].alpha = self.appearance.get('alpha');
                bbs[i].scale = self.appearance.get('scale');
                bbs[i].show = self.appearance.get('on');
            }
        },
    });
    return gridCurrentModel;
});