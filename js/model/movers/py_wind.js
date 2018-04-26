define([
    'model/movers/base',
    'model/environment/gridwind',
], function(BaseMover, GridWindModel) {
    var pyWindMover = BaseMover.extend({
        defaults: {
            obj_type: 'gnome.movers.py_wind_movers.PyWindMover'
        },
        model: {
            current: GridWindModel
        },

        initialize: function(attrs, options) {
            BaseMover.prototype.initialize.call(this, attrs, options);
        },

        constructor: function (attrs, options) {
            if (attrs.wind.obj_type.endsWith('GridWind')) {
                attrs.wind = new GridWindModel(attrs.wind);
            }

            BaseMover.prototype.constructor.call(this, attrs, options);
        },

    });

    return pyWindMover;
});