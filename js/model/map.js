define([
    'underscore',
    'jquery',
    'backbone',
    'ol',
    'model/base'
], function(_, $, Backbone, ol, BaseModel){
    'use strict';
    var gnomeMap = BaseModel.extend({
        urlRoot: '/map/',
        requesting: false,
        requested: false,
        geo_json: '',

        defaults: {
            obj_type: 'gnome.map.GnomeMap',
            filename: '',
        },

        initialize: function(options){
            BaseModel.prototype.initialize.call(options, this);
            this.on('change', this.resetRequest, this);
        },

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
            }
        },

        resetRequest: function(){
            this.requested = false;
        },

        getGeoJSON: function(callback){
            var url = webgnome.config.api + this.urlRoot + this.get('id') + '/geojson';
            if(!this.requesting && !this.requested){
                this.requesting = true;
                $.get(url, null, _.bind(function(geo_json){
                    this.requesting = false;
                    this.requested = true;
                    this.geo_json = geo_json;
                    callback(geo_json);
                }, this));
            } else {
                callback(this.geo_json);
            }
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var name = this.get('name');
            var filename = this.get('filename');
            var attrs = [];

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'File Name: ' + filename, key: 'File Name',
                         obj_type: this.get('filename'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        },

        getExtent: function(){
            var extent;
            if (!_.isUndefined(this.get('spillable_area'))){
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
        }
    });

    return gnomeMap;
});