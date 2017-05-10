define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gridCurrentModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
        	obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        
        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
        },
        
        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var fileName = this.get('filename');
            var name = this.get('name');
            var startTime = this.get('time').get('min_time');
            var endTime = this.get('time').get('max_time');
            var attrs = [];

            attrs.push({title: 'Filename: ' + fileName, key: 'Filename',
                         obj_type: this.get('filename'), action: 'edit', object: this});

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'Start Time: ' + startTime, key: 'Start Time',
                         obj_type: this.get('time').get('min_time'), action: 'read', object: this});
                         
            attrs.push({title: 'End Time: ' + startTime, key: 'End Time',
                         obj_type: this.get('time').get('max_time'), action: 'read', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return gridCurrentModel;
});