define([
    'model/movers/base',
    'model/environment/gridwind',
], function(BaseMover, GridWindModel) {
    var pyWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_wind_movers.PyWindMover'
        },

        model: {
            wind: GridWindModel
        }
    });
    return pyWindMover;
});