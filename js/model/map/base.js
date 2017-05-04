define([
    'underscore',
    'jquery',
    'model/base',
    'ol'
], function(_, $, BaseModel, ol){
    var baseMap = BaseModel.extend({
        urlRoot: '/map/',
        requesting: false,
        requested: false,
        geo_json: '',
        geographical: false,
        
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

        resetRequest: function(){
            this.requested = false;
        },

        getGeoJSON: function(callback){
            var url = this.urlRoot + this.get('id') + '/geojson';
            if(!this.requesting && !this.requested){
                this.requesting = true;
                $.get(url, null, _.bind(function(geo_json){
                    this.requesting = false;
                    this.requested = true;
                    this.geo_json = geo_json;
                    callback(geo_json);
                }, this));
            } else if (this.requested && this.geo_json) {
                callback(this.geo_json);
            }
            return null;
        }
    });

    return baseMap;
});
