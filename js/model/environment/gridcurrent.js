define([
    'model/environment/env_objs'
], function(BaseEnvObj){
    'use strict';
    var gridCurrentModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridCurrent'
        },
    });
    return gridCurrentModel;
});