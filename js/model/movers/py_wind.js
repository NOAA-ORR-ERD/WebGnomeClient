define([
    'model/movers/base'
], function(BaseMover){
    var pyWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_wind_movers.PyWindMover'
        }
    });

    return pyWindMover;
});