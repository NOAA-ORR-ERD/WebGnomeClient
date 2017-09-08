define([
    'model/environment/env_objs'
], function(BaseEnvObj){
    'use strict';
    var gridWindModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridWind'
        },
        
        initialize: function(attrs, options) {
            BaseEnvObj.prototype.initialize.call(this, attrs, options);
            if(!this.requested_vectors){
                this.getVecs(null);
                this.getMetadata(null);
            }
        }
    });
    return gridWindModel;
});