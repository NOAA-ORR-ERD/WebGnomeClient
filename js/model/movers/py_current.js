define([
    'model/movers/base',
    'model/environment/gridcurrent',
], function(BaseMover, GridCurrentModel){
    var pyCurrentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_current_movers.PyCurrentMover'
        },
        model: {
            current: GridCurrentModel
        }
    });

    return pyCurrentMover;
});