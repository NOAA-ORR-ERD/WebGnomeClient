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
                'name': 'ShapeOutput',
                'filename': 'Model.zip',
                'output_timestep': 3600,
                'zip_output': true,
                // Certain boundary
                'include_certain_boundary': false,
                'certain_boundary_separate_by_spill': true,
                'certain_boundary_hull_ratio': 0.5,
                'certain_boundary_hull_allow_holes': false,
                // Uncertain boundary
                'include_uncertain_boundary': true,
                'include_certain_in_uncertain_boundary': true,
                'uncertain_boundary_separate_by_spill': true,
                'uncertain_boundary_hull_ratio': 0.5,
                'uncertain_boundary_hull_allow_holes': false,
                'timeoffset': null
            }, FileOutputterModel.prototype.defaults);
        },

        toTree: function(){
            return '';
        }
    });

    return shapeFileOutputter;
});
