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
        },

        setExtrapolation: function(trueFalse) {
            var env = this.get('current');

            env.set('extrapolation_is_allowed', trueFalse);
            env.save();
        }
    });

    return pyCurrentMover;
});