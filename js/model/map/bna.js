define([
    'jquery',
    'underscore',
    'cesium',
    'model/map/base'
], function($, _, Cesium, BaseMap){
    var mapBnaModel = BaseMap.extend({
        geographical: true,

        defaults: function() {
            var def = {
                obj_type: 'gnome.maps.map.MapFromBNA',
                raster_size: 4096*4096,
            };
            _.defaults(def, BaseMap.prototype.defaults());
            return def;
        },



        validate: function(attrs, options){
            if (attrs.raster_size > 134217728) {
                return "Raster cannot be larger than 128 MB.";
            }
        },

        getRaster: function() {
            /*
            Gets the nodes of the grid from the server. Until we add subclasses for the different grid types,
            the data received will always be a Nx2 array of points (lon0, lat0, lon1, lat1, ..., lonN, latN)
            */
            if (_.isUndefined(this._getRasterPromise)) {
                this._getRasterPromise = new Promise(_.bind(function(resolve, reject){
                    this.map_cache.getItem(this.id + 'raster').then(_.bind(function(value){
                        if(value) {
                            console.log(this.id + ' raster found in store');
                            this.requesting = false;
                            this.requested_raster = true;
                            this.raster = value[0];
                            this.raster_shape = value[1];
                            this.raster_bbox = value[2];
                            resolve(this.raster);
                        } else {
                            if(!this.requesting && !this.requested_raster){
                                this.requesting = true;
                                var ur = this.urlRoot + this.id + '/raster';
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
                                    success: _.bind(function(raster, sts, response){
                                        this.raster_shape = response.getResponseHeader('shape').replace(/[L()]/g, '').split(',');
                                        this.raster_bbox = response.getResponseHeader('bbox').replace(/[\[\]]/g, '').split(',');
                                        this.raster_bbox = this.raster_bbox.map(function(i){ return i*1;});
                                        var width = this.raster_shape[1] * 1;
                                        var height = this.raster_shape[0] * 1;
                                        this.requesting = false;
                                        this.requested_raster = true;
                                        raster = new Uint8Array(raster);
                                        var dtype = Uint8ClampedArray;
                                        var data = new dtype(width * height * 4);
                                        var cv, idx;
                                        for (var i = 0; i < width*height; i++) {
                                            idx = 4*i;
                                            cv = raster[i]*255;
                                            data[idx] = cv;
                                            data[idx+1] = cv;
                                            data[idx+2] = cv;
                                            data[idx+3] = cv;
                                        }
                                        this.raster = new ImageData(data, width, height);
                                        this.map_cache.setItem(this.id + 'raster', [this.raster, this.raster_shape, this.raster_bbox]);
                                        resolve(this.raster);
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
            return this._getRasterPromise;
        },

        processRaster: function(raster) {
            var shw = this.get('_appearance').get('raster_on');
            var canvas = document.createElement('canvas');
            canvas.width = this.raster_shape[1];
            canvas.height = this.raster_shape[0];

            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.putImageData(this.raster, 0, 0);

            var rect = new Cesium.Rectangle(this.raster_bbox[0]*3.1415/180, this.raster_bbox[1]*3.1415/180, this.raster_bbox[4]*3.1415/180, this.raster_bbox[5]*3.1415/180);
            var e = new Cesium.Entity({
                rectangle : {
                    coordinates: rect,
                    material : canvas,
                    arcType: Cesium.ArcType.RHUMB
                    //outline: true,
                    //outlineColor: Cesium.Color.YELLOW,
                    //height: 0,
                },
                show: true
            });
            return e;
        },
        renderRaster: function(rebuild) {
            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild || _.isUndefined(this._raster_visObj)) {
                    this.getraster().then(_.bind(function(raster){
                        this.processRaster(raster, rebuild, this._linesPrimitive);
                        resolve(this._raster_visObj);
                    }, this)).catch(reject);
                }
                else {
                    resolve(this._linesPrimitive);
                }
            }, this));
        },
    });
    return mapBnaModel;
});