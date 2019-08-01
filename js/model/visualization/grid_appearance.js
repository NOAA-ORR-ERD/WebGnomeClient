//A model that stores appearance settings for various objects.

define([
        'model/visualization/appearance',
], function(BaseAppearance){
    'use strict';
    var gridAppearanceModel = BaseAppearance.extend({
        defaults: {
            on: false,
            color: '#585858', //dark gray
            alpha: 0.3,
            ctrl_names: {title: 'Grid Appearance',
                         on: 'Show',
                         color: 'Line Color',
                         alpha: 'Alpha',
                        },
        }
    });
    return gridAppearanceModel;
});
