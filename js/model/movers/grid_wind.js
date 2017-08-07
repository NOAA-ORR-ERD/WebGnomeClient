define([
    'model/movers/base'
], function(BaseMover){
    var gridWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.grid_wind.GridWindMover'
        }
    });

    return gridWindMover;
});