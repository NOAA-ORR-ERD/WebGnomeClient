//A model that stores appearance settings for various objects.
define([
    'underscore',
    'model/visualization/appearance'
], function(_, BaseAppearance){
'use strict';

    var SpillAppearanceModel = BaseAppearance.extend({
        defaults: function() { return {
            obj_type: 'gnome.utilities.appearance.SpatialReleaseAppearance',
            }
        }
    });
    return SpillAppearanceModel;
});
