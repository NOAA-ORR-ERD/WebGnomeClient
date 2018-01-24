define([
    'underscore',
    'jquery',
    'model/base',
    'ol',
    'cesium',
    'collection/appearances',
], function(_, $, BaseModel, ol, Cesium, AppearanceCollection){
    var baseMap = BaseModel.extend({
        urlRoot: '/map/',
        requesting: false,
        requested: false,
        geo_json: undefined,
        geographical: false,

        default_appearances: [
            {
                on: true,
                id: 'map',
                color: 'YELLOW',
                alpha: 1,
            },
            {
                on: false,
                id: 'sa',
                alpha: 1,
            },
            {
                on: false,
                id: 'bounds',
            }
        ],

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this._mapVis = new Cesium.GeoJsonDataSource({show: this.get('_appearance').findWhere({id: 'map'}).get('on')});
            this._spillableVis = new Cesium.CustomDataSource('Spillable Area');
            this._boundsVis = new Cesium.Entity({
                                polygon: {
                                    hierarchy: Cesium.Cartesian3.fromDegreesArray(_.flatten(this.get('map_bounds'))),
                                    material: Cesium.Color.WHITE.withAlpha(0),
                                    outline: true,
                                    outlineColor: Cesium.Color.BLUE,
                                    height: 0,
                                },
                            });
            this.get('_appearance').fetch().then(_.bind(this.setupVis, this));
            
        },

        setupVis: function(attrs) {
            this._mapVis.show = this.get('_appearance').findWhere({id: 'map'}).get('on');
            this._spillableVis.show = this.get('_appearance').findWhere({id: 'sa'}).get('on');
            this._boundsVis.show = this.get('_appearance').findWhere({id: 'bounds'}).get('on');
            this._mapVis.clampToGround = false;
            this.genMap();
            this.genSpillable();
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

        genSpillable: function() {
            let polygons = this.get('spillable_area');
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
                //let color = Cesium.COLOR[this.get('_appearance').findWhere({id:'map'}).get('on')].withAlpha
                this.getGeoJSON(_.bind(function(geojson) {
                    this._mapVis.load(geojson, {
                        strokeWidth: 0,
                        stroke: Cesium.Color.WHITE.withAlpha(0),
                        //fill: this.get('_(0.4),
                    });
                    this._mapVis.show = this.get('_appearance').findWhere({id:'map'}).get('on');
                }, this));
            }, this ));
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(options) {
                if(options.id === 'map') {
                    let vis = this._mapVis;
                    if (options.changedAttributes()){
                        //vis.fill = Cesium.Color[appearance.get('fill')];
                        //vis.alpha = appearance.get('alpha');
                        //vis.scale = appearance.get('scale');
                        vis.show = options.get('on');
                    }
                } else if (options.id === 'sa') {
                    let vis = this._spillableVis;
                    vis.show = options.get('on');
/*
                    if (options.changedAttributes()){
                        for (let i = 0; i < vis.entities.length; i++) {
                            vis.entities[i].show = options.get('on');
                        }
                    }
*/
                } else {
                    var vis = this._boundsVis;
                    if (options.changedAttributes()){
                        //vis.fill = Cesium.Color[appearance.get('fill')];
                        //vis.alpha = appearance.get('alpha');
                        //vis.scale = appearance.get('scale');
                        vis.show = options.get('on');
                    }
                }
            }
        },
    });

    return baseMap;
});
