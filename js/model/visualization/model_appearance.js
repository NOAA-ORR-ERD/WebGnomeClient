//A model that stores appearance settings for Model level configuration

define([
        'model/visualization/appearance',
], function(BaseAppearance){
    'use strict';
    var modelAppearanceModel = BaseAppearance.extend({
        defaults: {
            obj_type: 'gnome.utilities.appearance.ModelAppearance',
            uncertain_particles_on: true,
            uncertain_bounds_on: false,
            ctrl_names: {
                uncertain_particles_on: 'Show Uncertain Particles',
                uncertain_bounds_on: 'Show Uncertain Bounds',
            }
        }
    });
    return modelAppearanceModel;
});
