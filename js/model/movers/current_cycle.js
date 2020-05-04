define([
    'underscore',
    'model/movers/base',
    'cesium',
    'model/visualization/mover_appearance'
], function(_,BaseMover, Cesium, MoverAppearance){
    var currentCycle = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.current_movers.CurrentCycleMover'
            };
        },

    });

    return currentCycle;
});