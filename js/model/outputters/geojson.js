define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    geojsonOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.geo_json.GeoJson',
            'name': 'Outputter',
            'output_timestep': null,
            'output_last_step': 'true',
            'output_zero_step': 'true',
        },

        toTree: function(){
            return '';
        }
    });

    return geojsonOutputter;
});