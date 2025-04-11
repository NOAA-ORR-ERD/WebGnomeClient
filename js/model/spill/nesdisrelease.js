define([
    'jquery',
    'underscore',
    'backbone',
    'model/spill/spatialrelease',
    'model/visualization/spatial_release_appearance',
    'model/environment/tzoffset'
], function($, _, Backbone, PolygonRelease, PolygonReleaseAppearance, TZOffsetModel) {
    'use strict';
    var NesdisRelease = PolygonRelease.extend({

        model: {
            timezone_offset: TZOffsetModel
        },
        defaults: function() {
            return {
                obj_type: 'gnome.spills.release.NESDISRelease',
                num_elements: 1000,
                centroid: [0,0,0],
                _appearance: new PolygonReleaseAppearance(),
                timezone_offset: new TZOffsetModel()
            };
        },
    });
    return NesdisRelease;
});