//A model that stores appearance settings for various objects.

define([
        'model/visualization/appearance',
], function(BaseAppearance){
    'use strict';
    var moverAppearanceModel = BaseAppearance.extend({
        defaults: {
            vec_on: false,
            grid_on: false,
            vec_color: '#9370DB', //MEDIUMPURPLE,
            vec_alpha: 0.7,
            grid_color: '#585858', //dark gray
            grid_alpha: 0.3,
            alpha: 0.7,
            scale: 1,
            ctrl_names: {
                title: 'Mover Appearance',
                vec_on: 'Show Arrows',
                vec_color: 'Arrow Color',
                vec_alpha: 'Arrow Alpha',
                vec_scale: 'Arrow Scale',
                grid_on: 'Show Grid',
                grid_color: 'Grid Color',
                grid_alpha: 'Grid Alpha'
            }
        },
    });
    return moverAppearanceModel;
});
