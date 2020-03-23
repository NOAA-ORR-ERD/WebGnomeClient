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
                'filename': 'Model.zip',
                'output_timestep': 3600,
                'zip_output': true,
                'name': 'ShapeOutput'
            }, FileOutputterModel.prototype.defaults);
        },

        toTree: function(){
            return '';
        }
    });

    return shapeFileOutputter;
});