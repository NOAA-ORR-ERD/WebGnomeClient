define([
    'model/movers/base'
], function(BaseMover){
    var pyCurrentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_current_movers.PyCurrentMover'
        }
    });

    return pyCurrentMover;
});