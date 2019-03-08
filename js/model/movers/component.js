define([
    'model/movers/base',
    'model/environment/gridwind',
    'model/environment/wind',
    'model/visualization/mover_appearance'
], function(BaseMover, GridWind, Wind, MoverAppearance) {
    var componentMover = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.current_movers.ComponentMover'
            };
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
