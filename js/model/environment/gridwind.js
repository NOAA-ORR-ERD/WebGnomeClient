define([
    'model/environment/gridded_env_obj',
], function(GridEnvObj) {
    'use strict';
    var gridWindModel = GridEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridWind'
        },

        default_appearance: {
            on: false,
            ctrl_name: 'Vector Appearance',
            color: '#0000FF', //BLUE,
            alpha: 0.7,
            scale: 1,
        },

        vec_max: 30.0,
        n_vecs: 60,

        initialize: function(attrs, options) {
            GridEnvObj.prototype.initialize.call(this, attrs, options);
        },

        genVecImages: function(maxSpeed, numSteps) {
            GridEnvObj.prototype.genVecImages.call(this, this.vec_max, this.n_vecs);
        },
    });
    return gridWindModel;
});