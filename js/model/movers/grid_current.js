define([
    'model/movers/base'
], function(BaseMover){
    var gridCurrentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.current_movers.GridCurrentMover'
        }
    });

    return gridCurrentMover;
});