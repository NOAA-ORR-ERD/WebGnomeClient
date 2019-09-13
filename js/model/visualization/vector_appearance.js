//A model that stores appearance settings for various objects.

define([
        'model/visualization/appearance',
], function(BaseAppearance){
    'use strict';
    var vectorAppearanceModel = BaseAppearance.extend({
        defaults: {
            on: false,
            color: '#9370DB', //MEDIUMPURPLE,
            alpha: 0.7,
            ctrl_names: {title: 'Vector Appearance',
                         on: 'Show',
                         color: 'Arrow Color',
                         alpha: 'Alpha'
                        },
        },
    });
    return vectorAppearanceModel;
});
