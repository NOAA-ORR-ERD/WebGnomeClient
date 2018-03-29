define([
    'model/environment/gridded_env_obj',
], function(GridEnvObj){
    'use strict';
    var gridCurrentModel = GridEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        default_appearance: {
            on: false,
            ctrl_name: 'Vector Appearance',
            color: '#9370DB', //MEDIUMPURPLE,
            alpha: 0.7,
            scale: 1,
            ctrl_names: {title: 'Data Appearance',
                         on: 'Show',
                         color: 'Arrow Color',
                         alpha: 'Alpha',
                         scale: 'Scale'
                        },
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