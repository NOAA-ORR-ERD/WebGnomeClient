define([
    'underscore',
    'jquery',
    'model/base',
    'ol',
    'cesium',
    'model/visualization/map_appearance'
], function(_, $, BaseModel, ol, Cesium, MapAppearance){
    var baseMap = BaseModel.extend({
        urlRoot: '/map/',
        requesting: false,
        requested: false,
        geo_json: undefined,
        geographical: false,
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
            this.genMap();
            this.genAux('spillable_area');
            this.genAux('map_bounds');
        },

        getExtent: function(){
            var extent;
            if (!_.isUndefined(this.get('spillable_area')) && this.get('spillable_area').length >= 1){
                if (this.get('spillable_area').length === 1){
                    extent = ol.extent.boundingExtent(this.get('spillable_area')[0]);
                } else {
                    var areas = this.get('spillable_area');
                    extent = ol.extent.boundingExtent([]);
                    for (var i = 0; i < areas.length; i++){
                        var tempExtent = ol.extent.boundingExtent(areas[i]);
                        extent = ol.extent.extend(extent, tempExtent);
                    }
                }
            } else {
                extent = ol.extent.boundingExtent(this.get('map_bounds'));
            }
            return extent;
        },

        getSpillableArea: function(){
            var boundingPolygon;
            if (!_.isUndefined(this.get('spillable_area'))){
                if (this.get('spillable_area').length === 1){
                    boundingPolygon = new ol.geom.Polygon(this.get('spillable_area'));
                } else {
                    var area = [];
                    for(var a = 0; a < this.get('spillable_area').length; a++){
                        area.push(new ol.geom.Polygon([this.get('spillable_area')[a]]));
                    }
                    boundingPolygon = area;
                }
            } else {
                boundingPolygon = new ol.geom.Polygon(this.get('map_bounds'));
            }
            return boundingPolygon;
        },

        genAux: function(type) {
            var polygons = this.get(type);
            if  (polygons[0].length === 2) {
                polygons = [polygons];
            }
            if (!_.isEqual(_.flatten(polygons), _.flatten(this.defaults[type]))) {
                //polygons = [[-0.01,-0.01],[-0.01,0.01],[0.01,0.01],[0.01,-0.01]]
                var vis;
                for(var poly in polygons){
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
                    } else {
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
        },

        genBounds: function() {
            var polygons = this.get('');
            if (!_.isEqual(polygons[0],this.defaults.spillable_area[0])) {
                //polygons = [[-0.01,-0.01],[-0.01,0.01],[0.01,0.01],[0.01,-0.01]]

                for(var poly in polygons){
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

        resetRequest: function(){
            this.requested = false;
            delete this.geo_json;
        },

        getGeoJSON: function(callback){
            var url = this.urlRoot + this.get('id') + '/geojson';
            if(!this.requesting && !this.requested && _.isUndefined(this.geo_json)){
                console.log('request is being sent');
                this.requesting = true;
                $.get(url, null, _.bind(function(geo_json){
                    this.requesting = false;
                    this.requested = true;
                    this.geo_json = geo_json;
                    callback(geo_json);
                }, this));
            } else if (this.requested && this.geo_json) {
                callback(this.geo_json);
            } else {
                // make it wait and try again later
                _.delay(_.bind(this.getGeoJSON, this), 500, callback);
            }
            return null;
        },

        genMap: function() {
            return new Promise(_.bind(function(resolve, reject) {
                this._mapVis.removeAll();
                this._land_primitive = new Cesium.Primitive();
                this._lake_primitive = new Cesium.Primitive();
                this.getGeoJSON(_.bind(function(geojson) {
                    if (geojson.features.length > 0) {
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
                        var newEnt;
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
                        this._land_primitive = this._mapVis.add(
                            new Cesium.Primitive({
                                geometryInstances: land_geos,
                                appearance: land_appearance,
                                asynchronous: false
                            })
                        );
                        this._lake_primitive = this._mapVis.add(
                            new Cesium.Primitive({
                                geometryInstances: lake_geos,
                                appearance: lake_appearance,
                                asynchronous: false
                            })
                        );
                    }
                    this._mapVis.show = this.get('_appearance').get('map_on');
                }, this));
            }, this ));
        },

        updateVis: function(appearance) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(appearance) {
                var changed = appearance.changedAttributes();
                if('map_on' in changed || 'map_color' in changed) {
                    this._mapVis.show = appearance.get('map_on');
                }
                if ('sa_on' in changed) {
                    this._spillableVis.show = appearance.get('sa_on');
                }
                if ('bounds_on' in changed){
                    this._boundsVis.show = appearance.get('bounds_on');
                }
            }
        },
    });

    return baseMap;
});
