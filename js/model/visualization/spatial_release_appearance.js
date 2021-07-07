//A model that stores appearance settings for various objects.
define([
    'underscore',
    'model/visualization/appearance',
    'model/visualization/colormap'
], function(_, BaseAppearance, ColorMap){
'use strict';

    var SpatialReleaseAppearanceModel = BaseAppearance.extend({
        defaults: function() { return {
            obj_type: 'gnome.utilities.appearance.SpatialReleaseAppearance',
            colormap: new ColorMap({
                "units": 'um',
                "numberScaleType": "log",
                "numberScaleDomain": [0.0000001,0.5],
                "numberScaleRange": [0,1],
                "colorScaleType": "linear",
                "colorScaleDomain": [0, 1],
                "colorScaleRange": ["#fdbea0", "#fb6b40"],
                "scheme": "Custom",
                "colorBlockLabels": ['Thin', 'Thick'],
                }),
            };
        }
    });
    return SpatialReleaseAppearanceModel;
});
