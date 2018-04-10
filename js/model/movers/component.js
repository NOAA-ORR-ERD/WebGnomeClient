define([
    'model/movers/base',
    'model/environment/gridwind',
    'model/environment/wind'
], function(BaseMover, GridWind, Wind){
    var componentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.current_movers.ComponentMover'
        },

        model: {
            wind: {
                'gnome.environment.wind.Wind': Wind,
                'gnome.environment.environment_objects.GridWind': GridWind
            }
        }
    });

    return componentMover;
});