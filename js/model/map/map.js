define([
    'underscore',
    'backbone',
    'model/map/base',
    'model/visualization/map_appearance'
], function(_, Backbone, BaseMap, MapAppearance){
    'use strict';
    var gnomeMap = BaseMap.extend({
        defaults: {
            obj_type: 'gnome.maps.map.GnomeMap',
            filename: '',
            name: 'All Water',
            map_bounds: [
                [-360,-85.06],
                [-360,85.06],
                [360,85.06],
                [360,-85.06],
            ],
            north: 85.06,
            south: -85.06,
            west: -360,
            east: 360,
            _appearance: new MapAppearance()
        },

        initialize: function(options){
            BaseMap.prototype.initialize.call(this, options);
        },

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
            }
            if(attrs.north>90 || attrs.south<-90){
                return 'Latitude must be between -90 and 90.';
            }
            if(attrs.west<-360 || attrs.east>360){
                return 'Longitude must be between -360 and 360.';
            }
            if(attrs.north<=attrs.south){
                return 'North latitude must be greater than south latitude.';
            }
            if(attrs.east<=attrs.west){
                return 'East longitude must be greater than west longitude.';
            }
        },

        getGeoJSON: function() {
            //because a GnomeMap has no GeoJson this is a placeholder
            return Promise.resolve();
        },

        processMap: function(geojson, rebuild, primitiveColl) {
            //because a GnomeMap has no land, this function is simply a placeholder
            return primitiveColl;
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
        }
    });

    return gnomeMap;
});