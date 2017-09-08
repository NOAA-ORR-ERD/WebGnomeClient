define([
    'model/environment/env_objs'
], function(BaseEnvObj){
    'use strict';
    var gridCurrentModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
        
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