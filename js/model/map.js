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
            var boundingExtent;
            if (!_.isUndefined(this.get('spillable_area'))){
                if (this.get('spillable_area').length === 1){
                    boundingExtent = ol.extent.boundingExtent(this.get('spillable_area')[0]);
                }
            } else {
                boundingExtent = ol.extent.boundingExtent(this.get('map_bounds'));
            }
            return boundingExtent;
        }
    });

    return gnomeMap;
});