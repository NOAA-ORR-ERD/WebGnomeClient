define([
    'model/environment/env_objs',
    'model/environment/grid',
    'backbone'
], function(BaseEnvObj, BaseGridObj, BackBone){
    'use strict';
    var gridCurrentModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        model: {time: BackBone.Model,
                grid: BaseGridObj,
                variables: BackBone.Model},
        
        initialize: function(attrs, options) {
            BaseEnvObj.prototype.initialize.call(this, attrs, options);
            if(!this.requested_vectors){
                this.getVecs(null);
                this.getMetadata(null);
            }
        }
    });
    return gridCurrentModel;
});