define([
    'model/movers/base',
    'model/visualization/mover_appearance'
], function(BaseMover, MoverAppearance){
    var gridWindMover = BaseMover.extend({
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.current_movers.GridWindMover'
            };
        },
    });

    return gridWindMover;
});