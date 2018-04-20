define([
    'model/environment/gridded_env_obj',
    'model/visualization/vector_appearance'
], function(GridEnvObj, VectorAppearance){
    'use strict';
    var gridWindModel = GridEnvObj.extend({
        defaults: function() {
            return {
                _appearance: new VectorAppearance({color: '#0000FF'}),
                obj_type: 'gnome.environment.environment_objects.GridWind'
            };
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