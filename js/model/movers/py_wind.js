define([
    'model/movers/base',
    'model/environment/gridwind',
], function(BaseMover, GridWindModel) {
    var pyWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_wind_movers.GridWindMover'
        },

        model: {
            wind: GridWindModel
        },

        setExtrapolation: function(trueFalse) {
            var env = this.get('wind');

            env.set('extrapolation_is_allowed', trueFalse);
            env.save();
        },

        getBoundingRectangle: function() {
            return this.get('wind').get('grid').getBoundingRectangle();
        },
        
        getGrid: function() {
            return this.get('wind').get('grid').getLines();
        },

        processLines: function(data, rebuild, primitiveContainer) {
            return this.get('wind').get('grid').processLines(data, rebuild, primitiveContainer);
        }
    });

    return pyWindMover;
});
