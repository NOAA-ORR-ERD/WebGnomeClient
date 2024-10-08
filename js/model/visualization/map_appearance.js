//A model that stores appearance settings for various objects.

define([
        'model/visualization/appearance',
], function(BaseAppearance){
    'use strict';
    var mapAppearanceModel = BaseAppearance.extend({
        defaults: {
            obj_type: 'gnome.utilities.appearance.MapAppearance',
            map_on: true,
            sa_on: false,
            bounds_on: false,
            raster_on: false,
            uncertain_particles_on: true,
            uncertain_bounds_on: false,
            map_color: '#FFFF00',
            map_alpha: 1,
            ctrl_names: {
                map_on: 'Show Map',
                sa_on: 'Show Spillable Area',
                bounds_on: 'Show Map Bounds',
                raster_on: 'Show Map Raster',
                uncertain_particles_on: 'Show Uncertain Particles',
                uncertain_bounds_on: 'Show Uncertain Bounds',
                map_color: 'Land Color',
                map_alpha: 'Land Alpha'
            }
        }
    });
    return mapAppearanceModel;
});
