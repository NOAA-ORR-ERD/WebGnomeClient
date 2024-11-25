define([
    'underscore',
    'model/movers/base',
    'model/visualization/mover_appearance'
], function(_,BaseMover, MoverAppearance){
    var currentCycle = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.c_current_movers.CurrentCycleMover'
            };
        },

    });

    return currentCycle;
});