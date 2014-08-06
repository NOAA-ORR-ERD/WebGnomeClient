define([
    'underscore',
    'jquery',
    'backbone',
    'model/base'
], function(_, $, Backbone, BaseModel){
    var gnomeMap = BaseModel.extend({
        urlRoot: '/map/',

        validate: function(attrs, options){
            if(_.isNull(attrs.filename)){
                return 'A BNA/GeoJSON/JSON file must be associated with the model.';
            }
        },

        getGeoJSON: function(callback){
            var url = webgnome.api + this.urlRoot + this.get('id') + '/geojson';
            $.get(url, callback);
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