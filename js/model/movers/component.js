define([
    'model/movers/base'
], function(BaseMover){
    var componentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.current_movers.ComponentMover'
        }
    });

    return componentMover;
});