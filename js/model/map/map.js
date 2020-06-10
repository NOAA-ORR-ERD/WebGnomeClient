define([
    'underscore',
    'backbone',
    'model/map/base',
    'model/visualization/map_appearance'
], function(_, Backbone, BaseMap, MapAppearance){
    'use strict';
    var gnomeMap = BaseMap.extend({
        defaults: {
            obj_type: 'gnome.map.GnomeMap',
            filename: '',
            name: 'All Water',
            map_bounds: [
                [-180,-85.06],
                [-180,85.06],
                [180,85.06],
                [180,-85.06],
            ],
            spillable_area: [[
                [-360,-85.06],
                [-360,85.06],
                [360,85.06],
                [360,-85.06],
            ]],
            _appearance: new MapAppearance()
        },

        initialize: function(options){
            BaseMap.prototype.initialize.call(this, options);
        },

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
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
        }
    });

    return gnomeMap;
});