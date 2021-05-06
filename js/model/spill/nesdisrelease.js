define([
    'jquery',
    'underscore',
    'backbone',
    'model/spill/spatialrelease',
    'model/visualization/spatial_release_appearance'
], function($, _, Backbone, SpatialRelease, SpatialReleaseAppearance) {
    'use strict';
    var NesdisRelease = SpatialRelease.extend({
        defaults: function() {
            return {
                obj_type: 'gnome.spill.release.NESDISRelease',
                num_elements: 1000,
                centroid: [0,0],
                _appearance: new SpatialReleaseAppearance()
            };
        },
    });
    return NesdisRelease;
});