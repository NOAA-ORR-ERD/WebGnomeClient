define([
    'underscore',
    'backbone',
    'model/movers/base',
    'model/environment/env_objs'
], function(_, Backbone, BaseModel, GridCurrent){
    var pyCurrentMover = BaseModel.extend({
        defaults: {
            obj_type: 'gnome.movers.py_current_movers.PyCurrentMover',
            name: 'PyCurrentMover',
        },
        model: {
            current: GridCurrent
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
        },
    });

    return pyCurrentMover;
});