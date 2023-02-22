define([
    'cesium',
    'model/movers/base',
    'model/environment/gridcurrent'
], function(Cesium, BaseMover, GridCurrentModel){
    var pyCurrentMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_current_movers.CurrentMover'
        },

        model: {
            current: GridCurrentModel
        },

        setExtrapolation: function(trueFalse) {
            var env = this.get('current');

            env.set('extrapolation_is_allowed', trueFalse);
            env.save();
        },

        getBoundingRectangle: function() {
            return this.get('current').get('grid').getBoundingRectangle();
        },
        
        getGrid: function() {
            return this.get('current').get('grid').getLines();
        },

        processLines: function(data, rebuild, primitiveContainer) {
            return this.get('current').get('grid').processLines(data, rebuild, primitiveContainer);
        }

    });

    return pyCurrentMover;
});