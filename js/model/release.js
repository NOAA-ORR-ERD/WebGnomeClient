define([
    'underscore',
    'backbone',
    'model/base',
], function(_, Backbone, BaseModel){
    var gnomeRelease = BaseModel.extend({
        url: '/release',

        defaults: {
            'json_': 'webapi',
            'obj_type': 'gnome.spill.release.PointLineRelease',
            'end_position': [],
            'start_position': [],
            'num_elements': 1000,
            'num_released': 0,
            'start_time_invalid': true,
            'release_time': null,
            'end_release_time': null
        }
    });

    return gnomeRelease;
    
});