define([
    'model/environment/gridded_env_obj',
    'model/visualization/vector_appearance'
], function(GridEnvObj, VectorAppearance){
    'use strict';
    var gridCurrentModel = GridEnvObj.extend({
        defaults: function() {
            return {
                _appearance: new VectorAppearance(),
                obj_type: 'gnome.environment.environment_objects.GridCurrent'
            };
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