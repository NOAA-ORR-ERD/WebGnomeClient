define([
    'underscore',
    'backbone',
    'moment',
    'model/outputters/file_outputter'
], function(_, Backbone, moment, FileOutputterModel){
    'use strict';
    var ermaDataPackageOutputter = FileOutputterModel.extend({
        urlRoot: '/outputter/',

        defaults: function() {
            return _.defaults({
                'obj_type': 'gnome.outputters.erma_data_package.ERMADataPackageOutput',
                'name': 'ERMADataPackageOutput',
                'filename': 'Model.zip',
                'output_timestep': 3600,

                // Folder
                'folder_name': 'Testing Layers > Trajectories > Gnome-' + moment().format(),
                // Certain layer
                'certain_layer_name': 'Certain Particles',
                'include_certain_particles': true,
                // Uncertain layer
                'uncertain_layer_name': 'Uncertain Particles',
                'include_uncertain_particles': true,
                // Certain boundary
                'certain_boundary_layer_name': 'Certain Particles Boundary',
                'include_certain_boundary': false,
                'certain_boundary_separate_by_spill': true,
                'certain_boundary_hull_ratio': 0.5,
                'certain_boundary_hull_allow_holes': false,
                'certain_boundary_color': '#0000FF',
                'certain_boundary_size': 3,
                // Certain contours
                'certain_contours_layer_name': 'Certain Particles Contours',
                'include_certain_contours': false,
                'certain_contours_hull_ratio': 0.5,
                'certain_contours_hull_allow_holes': false,
                'certain_contours_size': 3,
                // Uncertain boundary
                'uncertain_boundary_layer_name': 'Uncertain Particles Boundary',
                'include_uncertain_boundary': true,
                'uncertain_boundary_separate_by_spill': true,
                'uncertain_boundary_hull_ratio': 0.5,
                'uncertain_boundary_hull_allow_holes': false,
                'uncertain_boundary_color': '#FF0000',
                'uncertain_boundary_size': 3,
                // Map bounds
                'map_bounds_layer_name': 'Map Bounds',
                'include_map_bounds': false,
                'map_bounds_color': '#FF0000',
                'map_bounds_size': 2,
                // Spillable area
                'spillable_area_layer_name': 'Spillable Area',
                'include_spillable_area': false,
                'spillable_area_color': '#0000FF',
                'spillable_area_size': 2,
                // Land polys
                'land_polys_layer_name': 'Land Polygons',
                'include_land_polys': false,
                'land_polys_color': '#000000',
                'land_polys_size': 2,
                // Spill location
                'include_spill_location': true,
                // Legend collapse
                'disable_legend_collapse': false,
                // Time settings.  If left null the server will try to detect
                'time_step_override': null,
                'time_unit_override': null,
            }, FileOutputterModel.prototype.defaults);
        },

        toTree: function(){
            return '';
        }
    });

    return ermaDataPackageOutputter;
});
