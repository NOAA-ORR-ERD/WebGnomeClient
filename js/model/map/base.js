define([
    'underscore',
    'jquery',
    'ol',
    'cesium',
    'localforage',
    'model/base',
    'model/visualization/map_appearance'
], function(_, $, ol, Cesium, localforage, BaseModel, MapAppearance) {
    var baseMap = BaseModel.extend({
        urlRoot: '/map/',

        reqStatusEnum: Object.freeze({
           'unrequested': 1,
           'requesting': 2,
           'requestingGrid': 3,
           'requested': 4 
        }),

        geo_json: undefined,
        geographical: false,
        map_cache : localforage.createInstance({name: 'Map Object Data Cache',
                                                 }),
        defaults: {
            obj_type: 'gnome.map.GnomeMap',
            filename: '',
            map_bounds: [
                [-180,-85.06],
                [-180,85.06],
                [180,85.06],
                [180,-85.06],
            ],
            spillable_area: [[
                [-180,-85.06],
                [-180,85.06],
                [180,85.06],
                [180,-85.06],
            ]],
            _appearance: new MapAppearance()
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            
            this.requestStatus = this.reqStatusEnum.unrequested;

            localforage.config({
                name: 'WebGNOME Map Cache',
                storeName: 'map_cache'
            });

            this.listenTo(this.get('_appearance'), 'change', this.updateVis);

            this._mapVis = new Cesium.PrimitiveCollection({
                show: this.get('_appearance').get('map_on'),
                id: this.get('id') + '_mapVis'
            });

            this._spillableVis = new Cesium.CustomDataSource('Spillable Area');
            this._boundsVis = new Cesium.CustomDataSource('Map Bounds');

            this.get('_appearance').fetch().then(_.bind(this.setupVis, this));
            
        },

        setupVis: function(attrs) {
            this._mapVis.show = this.get('_appearance').get('map_on');
            this._spillableVis.show = this.get('_appearance').get('sa_on');
            this._boundsVis.show = this.get('_appearance').get('bounds_on');
            this._mapVis.clampToGround = false;

            this.genMap(true);
            this.genAux('spillable_area');
            this.genAux('map_bounds');
        },

        getBoundingRectangle: function() {
            return new Promise(_.bind(function(resolve, reject) {
                resolve(Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(webgnome.model.get('map').get('map_bounds').flat())));
            }));
        },

        getExtent: function() {
            var extent;

            if (!_.isUndefined(this.get('spillable_area')) &&
                    this.get('spillable_area').length >= 1) {
                if (this.get('spillable_area').length === 1) {
                    extent = ol.extent.boundingExtent(this.get('spillable_area')[0]);
                }
                else {
                    var areas = this.get('spillable_area');
                    extent = ol.extent.boundingExtent([]);

                    for (var i = 0; i < areas.length; i++) {
                        var tempExtent = ol.extent.boundingExtent(areas[i]);
                        extent = ol.extent.extend(extent, tempExtent);
                    }
                }
            }
            else {
                extent = ol.extent.boundingExtent(this.get('map_bounds'));
            }

            return extent;
        },

        getSpillableArea: function() {
            var boundingPolygon;

            if (!_.isUndefined(this.get('spillable_area'))) {
                if (this.get('spillable_area').length === 1) {
                    boundingPolygon = new ol.geom.Polygon(this.get('spillable_area'));
                }
                else {
                    var area = [];

                    for(var a = 0; a < this.get('spillable_area').length; a++) {
                        area.push(new ol.geom.Polygon([this.get('spillable_area')[a]]));
                    }

                    boundingPolygon = area;
                }
            }
            else {
                boundingPolygon = new ol.geom.Polygon(this.get('map_bounds'));
            }

            return boundingPolygon;
        },

        genAux: function(type) {
            
            if (!_.isUndefined(this.get(type))) {
                
                var polygons = this.get(type);

                if  (polygons[0].length === 2) {
                    polygons = [polygons];
                }

                if (!_.isEqual(_.flatten(polygons),
                               _.flatten(this.defaults[type]))) {
                    // polygons = [[-0.01,-0.01],[-0.01,0.01],[0.01,0.01],[0.01,-0.01]]
                    var vis;

                    for(var poly in polygons) {
                        if (type === 'spillable_area') {
                            vis = this._spillableVis;

                            vis.entities.add({
                                polygon: {
                                    hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                                    material: Cesium.Color.BLUE.withAlpha(0.25),
                                    outline: true,
                                    outlineColor: Cesium.Color.BLUE.withAlpha(0.75),
                                    height: 0,
                                }
                            });
                        }
                        else {
                            vis = this._boundsVis;

                            vis.entities.add({
                                polygon: {
                                    hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                                    material: Cesium.Color.WHITE.withAlpha(0),
                                    outline: true,
                                    outlineColor: Cesium.Color.BLUE,
                                    height: 0,
                                }
                            });
                        }
                    }
                }
            }
        },

        genBounds: function() {
            var polygons = this.get('');

            if (!_.isEqual(polygons[0],this.defaults.spillable_area[0])) {
                //polygons = [[-0.01,-0.01],[-0.01,0.01],[0.01,0.01],[0.01,-0.01]]

                for (var poly in polygons) {
                    this._spillableVis.entities.add({
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(polygons[poly])),
                            material: Cesium.Color.BLUE.withAlpha(0.25),
                            outline: true,
                            outlineColor: Cesium.Color.BLUE.withAlpha(0.75),
                            height: 0,
                        }
                    });
                }
            }
        },

        resetRequest: function() {
            this.requestStatus = this.reqStatusEnum.unrequested;

            if (!_.isUndefined(this.geo_json)) {
                delete this.geo_json;
            }
        },

        getGeoJSON: function() {
            if (_.isUndefined(this._getGeoJsonPromise)) {
                this._getGeoJsonPromise = new Promise(_.bind(function(resolve, reject) {
                    this.map_cache.getItem(this.id + 'map').then(_.bind(function(geo_json) {
                        if (geo_json) {
                            console.log(this.get('name') + ' geojson found in store');

                            this.requestStatus = this.reqStatusEnum.requested;

                            this.geo_json = geo_json;
                            resolve(this.geo_json);
                        }
                        else {
                            if (_.isUndefined(this.id)) {
                                console.log('Map object has no ID to request');
                                this.geo_json = geo_json;
                                resolve(this.geo_json);
                            }
                            else if (this.requestStatus === this.reqStatusEnum.unrequested) {
                                var ur = this.urlRoot + this.id + '/geojson';
                                console.log('requesting: ' + ur);
                                this.requestStatus = this.reqStatusEnum.requesting;

                                $.get(ur, null, _.bind(function(geo_json) {
                                    this.requestStatus = this.reqStatusEnum.requestingGrid;

                                    this.geo_json = geo_json;
                                    this.map_cache.setItem(this.id + 'map',
                                                           geo_json);
                                    resolve(this.geo_json);
                                }, this));
                            }
                            else if (this.requestStatus === this.reqStatusEnum.requesting) {
                                reject(new Error('Request already in progress'));
                            }
                        }
                    },this)).catch(reject);
                }, this));
            }
            return this._getGeoJsonPromise;
        },

        genMap: function(rebuild) {
            if (_.isUndefined(rebuild)){
                rebuild = false;
            }

            return new Promise(_.bind(function(resolve, reject) {
                if (rebuild) {
                    this.getGeoJSON().then(_.bind(function(data){
                        this.processMap(data, rebuild, this._mapVis);
                        resolve(this._mapVis);
                    }, this)).catch(reject);
                }
                else {
                    resolve(this._mapVis);
                }
            }, this));
        },

        processMap: function(geojson, rebuild, primitiveColl) {
            var shw = this.get('_appearance').get('map_on');

            if (_.isUndefined(primitiveColl)) {
                primitiveColl = this._mapVis;
            }

            if (primitiveColl !== this._mapVis){
                shw = true;
            }

            if (geojson &&
                !_.isUndefined(geojson.features) &&
                geojson.features.length > 0) {
                var land_polys = geojson.features[0].geometry.coordinates;
                var lake_polys = geojson.features[1].geometry.coordinates;

                var transbs = {
                    enabled : true,
                    equationRgb : Cesium.BlendEquation.ADD,
                    equationAlpha : Cesium.BlendEquation.ADD,
                    functionSourceRgb : Cesium.BlendFunction.SOURCE_ALPHA,
                    functionSourceAlpha : Cesium.BlendFunction.SOURCE_ALPHA,
                    functionDestinationRgb : Cesium.BlendFunction.ONE_MINUS_SOURCE_ALPHA,
                    functionDestinationAlpha : Cesium.BlendFunction.ONE_MINUS_SOURCE_ALPHA
                };

                var custombs = {
                    enabled : true,
                    equationRgb : Cesium.BlendEquation.MAX,
                    equationAlpha : Cesium.BlendEquation.MIN,
                    functionSourceRgb : Cesium.BlendFunction.SOURCE_ALPHA,
                    functionSourceAlpha : Cesium.BlendFunction.SOURCE_ALPHA,
                    functionDestinationRgb : Cesium.BlendFunction.ONE_MINUS_SOURCE_ALPHA,
                    functionDestinationAlpha : Cesium.BlendFunction.ONE_MINUS_SOURCE_ALPHA
                };

                var land_appearance = new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: true,
                    renderState: {
                        depthMask: true,
                        blending: transbs
                    },
                });

                var lake_appearance = new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: false,
                    renderState: {
                        depthMask: true,
                        blending: custombs
                    },
                });

                var newGeo;
                var i, poly;
                var lake_geos = [];
                var land_geos = [];

                for (i = 0; i < land_polys.length; i++) {
                    poly = land_polys[i];
                    newGeo = new Cesium.GeometryInstance({
                        geometry: new Cesium.PolygonGeometry({
                            polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(poly[0].flat())),
                            height: -2
                        }),
                        attributes : {
                            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.KHAKI.withAlpha(0.6))
                        }
                    });
                    land_geos.push(newGeo);
                }

                for (i = 0; i < lake_polys.length; i++) {
                    poly = lake_polys[i];
                    newGeo = new Cesium.GeometryInstance({
                        geometry: new Cesium.PolygonGeometry({
                            polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(poly[0].flat())),
                            height: -1
                        }),
                        attributes : {
                            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK.withAlpha(1))
                        }
                    });
                    lake_geos.push(newGeo);
                }

                primitiveColl.add(
                    new Cesium.Primitive({
                        geometryInstances: land_geos,
                        appearance: land_appearance,
                        asynchronous: false,
                        show: shw
                    })
                );

                primitiveColl.add(
                    new Cesium.Primitive({
                        geometryInstances: lake_geos,
                        appearance: lake_appearance,
                        asynchronous: false,
                        show: shw
                    })
                );
            }

            primitiveColl.show = shw;

            return primitiveColl;
        },

        updateVis: function(appearance) {
            // Updates the appearance of this model's graphics object.
            // Implementation varies depending on the specific object type
            if (appearance) {
                var changed = appearance.changedAttributes();

                if ('map_on' in changed || 'map_color' in changed) {
                    this._mapVis.show = appearance.get('map_on');
                }

                if ('sa_on' in changed) {
                    this._spillableVis.show = appearance.get('sa_on');
                }

                if ('bounds_on' in changed) {
                    this._boundsVis.show = appearance.get('bounds_on');
                }
            }
        },
    });

    return baseMap;
});
