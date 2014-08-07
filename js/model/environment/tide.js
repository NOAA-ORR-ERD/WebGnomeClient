define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var tideModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
        	obj_type: 'gnome.environment.Tide'
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var fileName = this.get('filename');
            var name = this.get('name');
            var scaleFactor = this.get('scale_factor');
            var attrs = [];

            attrs.push({title: 'Filename: ' + fileName, key: 'Filename',
                         obj_type: this.get('filename'), action: 'edit', object: this});

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'Scale Factor: ' + scaleFactor, key: 'Scale Factor',
                         obj_type: this.get('scale_factor'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return tideModel;
});