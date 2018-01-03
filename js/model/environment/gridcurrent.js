define([
    'model/environment/gridded_env_obj',
], function(GridEnvObj){
    'use strict';
    var gridCurrentModel = GridEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        default_appearance: {
            on: true,
            color: 'MEDIUMPURPLE',
            alpha: 0.7,
            scale: 1,
        },
        vec_max: 3.0,
        n_vecs: 30,
        
        initialize: function(attrs, options) {
            GridEnvObj.prototype.initialize.call(this, attrs, options);
        },

        genVecImages: function(maxSpeed, numSteps) {
            GridEnvObj.prototype.genVecImages.call(this, this.vec_max, this.n_vecs);
        },

    });
    return gridCurrentModel;
});