define([
    'underscore',
    'model/movers/base',
    'cesium',
    'model/visualization/mover_appearance'
], function(_,BaseMover, Cesium, MoverAppearance) {
    var gridCurrentMover = BaseMover.extend({
        //Legacy c_GridCurrentMover model object
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.c_current_movers.c_GridCurrentMover'
            };
        },

        setExtrapolation: function(trueFalse) {
            this.set('extrapolate', trueFalse);
            this.save();
        }
    });

    return gridCurrentMover;
});
