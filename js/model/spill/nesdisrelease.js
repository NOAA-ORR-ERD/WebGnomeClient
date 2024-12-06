define([
    'jquery',
    'underscore',
    'backbone',
    'model/spill/spatialrelease',
    'model/visualization/spatial_release_appearance'
], function($, _, Backbone, PolygonRelease, PolygonReleaseAppearance) {
    'use strict';
    var NesdisRelease = PolygonRelease.extend({
        defaults: function() {
            return {
                obj_type: 'gnome.spills.release.NESDISRelease',
                num_elements: 1000,
                centroid: [0,0,0],
                _appearance: new PolygonReleaseAppearance()
            };
        },
    });
    return NesdisRelease;
});