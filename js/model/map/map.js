define([
    'backbone',
    'model/map/base'
], function(Backbon, BaseMap){
    'use strict';
    var gnomeMap = BaseMap.extend({
        defaults: {
            obj_type: 'gnome.map.GnomeMap',
            filename: '',
        },

        initialize: function(options){
            BaseMap.prototype.initialize.call(this, options);
            this.on('change', this.resetRequest, this);
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