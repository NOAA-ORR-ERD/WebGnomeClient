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
            'end_position': [0, 0, 0],
            'start_position': [0, 0, 0],
            'num_elements': 1000,
            'num_released': 0,
            'start_time_invalid': true,
            'release_time': "2013-02-13T15:00:00",
            'end_release_time': "2013-02-13T15:00:00"
        }
    });

    return gnomeRelease;
    
});