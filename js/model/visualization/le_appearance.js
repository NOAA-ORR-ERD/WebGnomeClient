//A model that stores appearance settings for various objects.

define([
        'model/visualization/appearance',
        'model/visualization/colormap'
], function(BaseAppearance, ColorMap){
    'use strict';
    var SpillAppearanceModel = BaseAppearance.extend({
        defaults: function() { return {
            pin_on: true
            les_on: true,
            scale: 1,
            id: 'les',
            data: 'Mass',
            colormap: new ColorMap(),
            ctrl_names: {title:'Spill Appearance',
                         pin_on: 'Show Pin',
                         les_on: 'Show Oil',
                         scale: 'Scale',
                         data: 'Data Source'
                        },
            };
        }
    });
    return SpillAppearanceModel;
});
