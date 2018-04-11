define([
    'underscore',
    'model/movers/base',
    'cesium'
], function(_,BaseMover, Cesium){
    var gridCurrentMover = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: {
            obj_type: 'gnome.movers.current_movers.GridCurrentMover'
        },

        
    });

    return gridCurrentMover;
});