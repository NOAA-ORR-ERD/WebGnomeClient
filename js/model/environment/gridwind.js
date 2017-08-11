define([
    'model/environment/env_objs'
], function(BaseEnvObj){
    'use strict';
    var gridWindModel = BaseEnvObj.extend({
        defaults: {
            obj_type: 'gnome.environment.environment_objects.GridWind'
        },
    });
    return gridWindModel;
});