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
        },

        setExtrapolation: function(trueFalse) {
            var env = this.get('wind');

            env.set('extrapolation_is_allowed', trueFalse);
            env.save();
        }
    });

    return pyWindMover;
});
