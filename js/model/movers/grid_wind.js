define([
    'model/movers/base'
], function(BaseMover){
    var gridWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.wind_movers.GridWindMover'
        }
    });

    return gridWindMover;
});