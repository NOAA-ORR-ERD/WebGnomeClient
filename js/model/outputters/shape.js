define([
    'underscore',
    'backbone',
    'model/outputters/file_outputter'
], function(_, Backbone, FileOutputterModel){
    'use strict';
    var shapeFileOutputter = FileOutputterModel.extend({
        urlRoot: '/outputter/',

        defaults: function() {
            return _.defaults({
                'obj_type': 'gnome.outputters.shape.ShapeOutput',
                'name': 'Model',
                'filename': 'Model.shp',
                'output_timestep': 900
            }, FileOutputterModel.prototype.defaults);
        },

        initialize: function(options) {
            FileOutputterModel.prototype.initialize.call(this, options);
            var name = this.get('name');

            this.set('filename', name + '.shp');
        },

        toTree: function(){
            return '';
        }
    });

    return shapeFileOutputter;
});