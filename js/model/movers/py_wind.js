define([
    'underscore',
    'model/movers/base',
    'model/environment/gridwind',
], function(_, BaseMover, GridWindModel) {
    var pyWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_wind_movers.WindMover',
            default_num_method: 'RK2'
        },

        model: Object.assign(
            _.clone(BaseMover.prototype.model),
            {wind: GridWindModel}
        ),

        setExtrapolation: function(trueFalse) {
            var env = this.get('wind');

            env.set('extrapolation_is_allowed', trueFalse);
            env.save();
        },

        getBoundingRectangle: function() {
            return this.get('wind').get('grid').getBoundingRectangle();
        },

        getGrid: function() {
            if (this.get('wind').get('grid')) {
                return this.get('wind').get('grid').getLines();
            }
        },

        processLines: function(data, rebuild, primitiveContainer) {
            return this.get('wind').get('grid').processLines(data, rebuild, primitiveContainer);
        }
    });

    return pyWindMover;
});
