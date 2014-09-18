define([
    'underscore',
    'backbone',
    'model/base',
    'moment'
], function(_, Backbone, BaseModel){
    var gnomeRelease = BaseModel.extend({
        url: '/release',

        defaults: {
            'json_': 'webapi',
            'obj_type': 'gnome.spill.release.PointLineRelease',
            'end_position': [0, 0, 0],
            'start_position': [0, 0, 0],
            'num_elements': 500,
            'num_released': 0,
            'start_time_invalid': true,
            'release_time': '2013-02-13T15:00:00',
            'end_release_time': '2013-02-13T15:00:00'
        },

        validate: function(attrs, options){
            if(parseFloat(attrs.start_position[0]) != attrs.start_position[0] || parseFloat(attrs.start_position[1]) != attrs.start_position[1]){
                return 'Start position must be in decimal degrees.';
            }

            if(parseFloat(attrs.end_position[0]) != attrs.end_position[0] || parseFloat(attrs.end_position[1]) != attrs.end_position[1]){
                return 'Start position must be in decimal degrees.';
            }

            if(isNaN(attrs.num_elements)){
                return 'Release amount must be a number.';
            }

            if (moment(attrs.release_time).isAfter(attrs.end_release_time)){
                return 'Duration must be a positive value';
            }

        }

    });

    return gnomeRelease;
    
});